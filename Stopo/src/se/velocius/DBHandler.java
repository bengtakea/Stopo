package se.velocius;

import com.amazonaws.AmazonClientException;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;

public class DBHandler {

	public static AmazonDynamoDBClient dynamoDB;

	public static AmazonDynamoDBClient getDynamoDB() {
		if (dynamoDB == null) {
			/*
			 * The ProfileCredentialsProvider will return your [default]
			 * credential profile by reading from the credentials file located
			 * at (C:\\Users\\Bengt-Åke\\.aws\\credentials).
			 */
			dynamoDB = new AmazonDynamoDBClient(/* credentials */);
			if (dynamoDB == null) {
				throw new AmazonClientException("Ingen DynamoDB-klient");
			}
			dynamoDB.setRegion(Region.getRegion(Regions.EU_CENTRAL_1));

		}
		return dynamoDB;
	}

	public static DynamoDBMapper getDBMapper() {
		DynamoDBMapper mapper = new DynamoDBMapper(getDynamoDB());
		return mapper;
	}
}
