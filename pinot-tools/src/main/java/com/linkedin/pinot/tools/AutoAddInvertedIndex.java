/**
 * Copyright (C) 2014-2016 LinkedIn Corp. (pinot-core@linkedin.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.linkedin.pinot.tools;

import com.linkedin.pinot.common.config.AbstractTableConfig;
import com.linkedin.pinot.common.config.IndexingConfig;
import com.linkedin.pinot.common.data.Schema;
import com.linkedin.pinot.common.utils.SchemaUtils;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import javax.annotation.Nonnull;
import org.apache.helix.PropertyPathConfig;
import org.apache.helix.PropertyType;
import org.apache.helix.ZNRecord;
import org.apache.helix.manager.zk.ZKHelixAdmin;
import org.apache.helix.manager.zk.ZNRecordSerializer;
import org.apache.helix.store.zk.ZkHelixPropertyStore;
import org.json.JSONObject;


/**
 * This tool will directly modify the table configs in ZooKeeper.
 * PLEASE USE IT VERY CAREFULLY!
 */
public class AutoAddInvertedIndex {
  private AutoAddInvertedIndex() {
  }

  private static final String AUTO_GENERATED_INVERTED_INDEX_KEY = "autoGeneratedInvertedIndex";

  private static final String ZK_ADDRESS = "zkAddress:zkPort";
  private static final String CLUSTER_NAME = "pinot-cluster";
  private static final String TABLE_CONFIG_PATH = "/CONFIGS/TABLE/";
  private static final String SCHEMA_PATH = "/SCHEMAS/";
  private static final ZKHelixAdmin HELIX_ADMIN = new ZKHelixAdmin(ZK_ADDRESS);
  private static final ZkHelixPropertyStore<ZNRecord> PROPERTY_STORE =
      new ZkHelixPropertyStore<>(ZK_ADDRESS, new ZNRecordSerializer(),
          PropertyPathConfig.getPath(PropertyType.PROPERTYSTORE, CLUSTER_NAME));

  private static final String BROKER_QUERY_URL = "http://brokerAddress:brokerPort/query";

  private static final long TABLE_SIZE_THRESHOLD = 100_000_000;

  private static AbstractTableConfig getTableConfig(String tableName)
      throws Exception {
    return AbstractTableConfig.fromZnRecord(PROPERTY_STORE.get(TABLE_CONFIG_PATH + tableName, null, 0));
  }

  private static void setTableConfig(String tableName, AbstractTableConfig tableConfig)
      throws Exception {
    ZNRecord znRecord = AbstractTableConfig.toZnRecord(tableConfig);
    znRecord.setSimpleField(AUTO_GENERATED_INVERTED_INDEX_KEY, "true");
    PROPERTY_STORE.set(TABLE_CONFIG_PATH + tableName, znRecord, 1);
  }

  private static Schema getTableSchema(String tableName)
      throws Exception {
    ZNRecord znRecord = PROPERTY_STORE.get(SCHEMA_PATH + tableName, null, 0);
    if (znRecord == null) {
      return null;
    } else {
      return SchemaUtils.fromZNRecord(znRecord);
    }
  }

  private static JSONObject sendQuery(String query)
      throws Exception {
    URLConnection urlConnection = new URL(BROKER_QUERY_URL).openConnection();
    urlConnection.setDoOutput(true);

    BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(urlConnection.getOutputStream(), "UTF-8"));
    writer.write(new JSONObject().put("pql", query).toString());
    writer.flush();

    BufferedReader reader = new BufferedReader(new InputStreamReader(urlConnection.getInputStream(), "UTF-8"));
    return new JSONObject(reader.readLine());
  }

  private static class ResultPair implements Comparable<ResultPair> {
    private final String _key;
    private final long _value;

    public ResultPair(String key, long value) {
      _key = key;
      _value = value;
    }

    @Override
    public int compareTo(@Nonnull ResultPair o) {
      return Long.compare(o._value, _value);
    }

    @Override
    public String toString() {
      return _key + ": " + _value;
    }
  }

  public static void main(String[] args)
      throws Exception {
    // Get all resources in cluster.
    List<String> resourcesInCluster = HELIX_ADMIN.getResourcesInCluster(CLUSTER_NAME);
    Collections.sort(resourcesInCluster);

    for (String tableName : resourcesInCluster) {

      // Only process on tables with specific keyword.
      if (tableName.contains("_non_additive_")) {

        // Get the inverted index config.
        AbstractTableConfig tableConfig = getTableConfig(tableName);
        IndexingConfig indexingConfig = tableConfig.getIndexingConfig();
        List<String> invertedIndexColumns = indexingConfig.getInvertedIndexColumns();

        // Handle null inverted index columns.
        if (invertedIndexColumns == null) {
          invertedIndexColumns = new ArrayList<>();
          indexingConfig.setInvertedIndexColumns(invertedIndexColumns);
        }

        // Remove empty string.
        int emptyStringIndex;
        while ((emptyStringIndex = invertedIndexColumns.indexOf("")) != -1) {
          invertedIndexColumns.remove(emptyStringIndex);
        }

        // Only add inverted index if there is no existing ones.
        if (invertedIndexColumns.isEmpty()) {

          // Table must have a schema to add inverted index.
          Schema tableSchema = getTableSchema(tableName);
          if (tableSchema != null) {

            // Skip tables without dimensions.
            List<String> dimensionNames = tableSchema.getDimensionNames();
            if (dimensionNames.size() == 0) {
              continue;
            }

            // Skip tables without proper time column.
            String timeColumnName = tableSchema.getTimeColumnName();
            if (timeColumnName == null || !timeColumnName.equals("Date")) {
              continue;
            }

            // Only add inverted index to table larger than a threshold.
            JSONObject queryResponse = sendQuery("SELECT COUNT(*) FROM " + tableName);
            long numTotalDocs = queryResponse.getLong("totalDocs");
            if (numTotalDocs > TABLE_SIZE_THRESHOLD) {

              // Get each dimension's cardinality on one day's data.
              queryResponse = sendQuery("SELECT Max(Date) FROM " + tableName);
              int maxDate = queryResponse.getJSONArray("aggregationResults").getJSONObject(0).getInt("value");
              // Query DISTINCTCOUNT on all dimensions in one query might cause timeout, so query them separately.
              List<ResultPair> resultPairs = new ArrayList<>();
              for (String dimensionName : dimensionNames) {
                String query =
                    "SELECT DISTINCTCOUNT(" + dimensionName + ") FROM " + tableName + " WHERE Date = " + maxDate;
                queryResponse = sendQuery(query);
                JSONObject result = queryResponse.getJSONArray("aggregationResults").getJSONObject(0);
                resultPairs.add(new ResultPair(result.getString("function"), result.getLong("value")));
              }

              // Sort the dimensions based on their cardinalities.
              Collections.sort(resultPairs);

              // Add the top 2 dimensions into inverted index columns.
              ResultPair resultPair = resultPairs.get(0);
              if (resultPair._value > 1) {
                invertedIndexColumns.add(resultPair._key.substring("distinctCount_".length()));
              } else {
                System.err.println("Got abnormal cardinality: " + resultPair + " in table: " + tableName);
              }
              if (resultPairs.size() > 1) {
                resultPair = resultPairs.get(1);
                if (resultPair._value > 1) {
                  invertedIndexColumns.add(resultPair._key.substring("distinctCount_".length()));
                } else {
                  System.err.println("Got abnormal cardinality: " + resultPair + " in table: " + tableName);
                }
              }
              if (!invertedIndexColumns.isEmpty()) {
                System.out.println("Added inverted index columns: " + invertedIndexColumns + " to table: " + tableName);
                setTableConfig(tableName, tableConfig);
              }
            }
          }
        }
      }
    }
  }
}
