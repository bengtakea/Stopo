package se.velocius.model;

import java.util.Date;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBAttribute;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBAutoGeneratedKey;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBHashKey;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBTable;

@DynamoDBTable(tableName = "Transaction")
public class Transaction {

	private String sid;
	private String stockSid;
	private String type;
	private Date date;
	private int shares;
	private double price;
	private String portfolio;

	@DynamoDBHashKey(attributeName = "Sid")
	@DynamoDBAutoGeneratedKey
	public String getSid() {
		return sid;
	}

	public void setSid(String sid) {
		this.sid = sid;
	}

	@DynamoDBAttribute(attributeName = "StockSid")
	public String getStockSid() {
		return stockSid;
	}

	public void setStockSid(String stockSid) {
		this.stockSid = stockSid;
	}

	@DynamoDBAttribute(attributeName = "Type")
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	@DynamoDBAttribute(attributeName = "Date")
	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	@DynamoDBAttribute(attributeName = "Shares")
	public int getShares() {
		return shares;
	}

	public void setShares(int shares) {
		this.shares = shares;
	}

	@DynamoDBAttribute(attributeName = "Price")
	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}

	@DynamoDBAttribute(attributeName = "Portfolio")
	public String getPortfolio() {
		return portfolio;
	}

	public void setPortfolio(String portfolio) {
		this.portfolio = portfolio;
	}

	public int delta() {
		if (type.equals("sell")) {
			return -shares;
		}
		return shares;
	}

	public double costDelta() {
		return shares * price;
	}
}
