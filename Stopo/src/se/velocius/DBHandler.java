package se.velocius;

import com.amazonaws.AmazonClientException;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.profile.ProfileCredentialsProvider;
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
			AWSCredentials credentials = null;
			try {
				credentials = new ProfileCredentialsProvider("default")
						.getCredentials();
			} catch (Exception e) {
				throw new AmazonClientException(
						"Cannot load the credentials from the credential profiles file. "
								+ "Please make sure that your credentials file is at the correct "
								+ "location (C:\\Users\\Bengt-Åke\\.aws\\credentials), and is in valid format.",
						e);
			}
			dynamoDB = new AmazonDynamoDBClient(credentials);
			dynamoDB.setRegion(Region.getRegion(Regions.EU_CENTRAL_1));

		}
		return dynamoDB;
	}

	public static DynamoDBMapper getDBMapper() {
		DynamoDBMapper mapper = new DynamoDBMapper(getDynamoDB());
		return mapper;
	}
}
