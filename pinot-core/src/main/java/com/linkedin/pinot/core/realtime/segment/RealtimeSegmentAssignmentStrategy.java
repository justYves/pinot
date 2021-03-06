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

package com.linkedin.pinot.core.realtime.segment;

import com.linkedin.pinot.common.exception.InvalidConfigException;
import com.linkedin.pinot.common.partition.PartitionAssignment;
import java.util.List;
import java.util.Map;


/**
 * An interface for segment assignment of realtime segments
 */
public interface RealtimeSegmentAssignmentStrategy {

  /**
   * Given list of segments and a partition assignment, assigns the segments onto instances
   * @param newSegments
   * @param partitionAssignment
   * @return
   */
  Map<String, List<String>> assign(List<String> newSegments, PartitionAssignment partitionAssignment)
      throws InvalidConfigException;
}