module.exports = {
  /**
   *
   * @param aws - AWS config
   * @param ddb - DynamoDB instance
   * @param ddbClient DynamoDB.DocumentClient instance
   * @return {Promise<void>}
   */
  up: async (awsConfig, ddb, ddbClient) => {},

  /**
   *
   * @param aws - AWS config
   * @param ddb - DynamoDB instance
   * @param ddbClient DynamoDB.DocumentClient instance
   * @return {Promise<void>}
   */
  down: async (awsConfig, ddb, ddbClient) => {},
};
