package se.velocius;

import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import se.velocius.model.Stock;
import se.velocius.model.Transaction;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBQueryExpression;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBScanExpression;
import com.amazonaws.services.dynamodbv2.model.AttributeValue;
import com.amazonaws.services.dynamodbv2.model.ComparisonOperator;
import com.amazonaws.services.dynamodbv2.model.Condition;

@Path("/stoposervice")
public class StoPoService {
	@GET
	@Produces(MediaType.TEXT_PLAIN)
	public String sayPlainTextHello() {
		return "Hello Jersey";
	}

	@GET
	@Path("/getstocks")
	@Produces(MediaType.APPLICATION_JSON)
	public Stock[] getStocks() {
		DynamoDBMapper mapper = DBHandler.getDBMapper();

		DynamoDBScanExpression scanExpression = new DynamoDBScanExpression();
		List<Stock> stocks = mapper.scan(Stock.class, scanExpression);

		return stocks.toArray(new Stock[stocks.size()]);
	}

	@POST
	@Path("/stock")
	@Consumes("application/json")
	public Stock addStock(final Stock stock) {
		DynamoDBMapper mapper = DBHandler.getDBMapper();

		DynamoDBScanExpression scanExpression = new DynamoDBScanExpression();
		scanExpression.addFilterCondition(
				"YahooTicker",
				new Condition().withComparisonOperator(ComparisonOperator.EQ)
						.withAttributeValueList(
								new AttributeValue().withS(stock
										.getYahooTicker())));
		List<Stock> stocks = mapper.scan(Stock.class, scanExpression);
		if (stocks.size() > 0) {
			String errStr = "Duplicat : " + stocks.get(0);
			System.out.println(errStr);

		} else {
			mapper.save(stock);
		}

		return stock;
	}

	@GET
	@Path("/stock")
	@Produces(MediaType.APPLICATION_JSON)
	public Stock getStock(@QueryParam("sid") final String sid) {
		DynamoDBMapper mapper = DBHandler.getDBMapper();

		Stock stock = new Stock();
		stock.setSid(sid);
		List<Stock> stocks = mapper.query(Stock.class,
				new DynamoDBQueryExpression<Stock>().withHashKeyValues(stock));
		return stocks.get(0);
	}

	@POST
	@Path("/trans")
	@Consumes("application/json")
	public Transaction addTrans(final Transaction transaction) {
		DynamoDBMapper mapper = DBHandler.getDBMapper();

		mapper.save(transaction);

		return transaction;
	}

	@GET
	@Path("/trans")
	@Produces(MediaType.APPLICATION_JSON)
	public Transaction[] getTransactions(
			@QueryParam("stockSid") final String stockSid) {
		DynamoDBMapper mapper = DBHandler.getDBMapper();

		DynamoDBScanExpression scanExpression = new DynamoDBScanExpression();
		scanExpression.addFilterCondition("StockSid", new Condition()
				.withComparisonOperator(ComparisonOperator.EQ)
				.withAttributeValueList(new AttributeValue().withS(stockSid)));
		List<Transaction> transactions = mapper.scan(Transaction.class,
				scanExpression);

		return transactions.toArray(new Transaction[transactions.size()]);
	}

}
