package se.velocius;

import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.summingInt;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import se.velocius.model.Portfolio;
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
		List<Transaction> transactions = mapper.scan(Transaction.class,
				scanExpression);

		Map<String, Integer> noSharesByStockSid = transactions.stream()
				.collect(
						groupingBy(Transaction::getStockSid,
								summingInt(Transaction::delta)));

		stocks.stream()
				.filter(s -> noSharesByStockSid.containsKey(s.getSid()))
				.forEach(s -> s.setNoShares(noSharesByStockSid.get(s.getSid())));

		Map<String, Double> costBasisByStockSid = transactions
				.stream()
				.sorted(new Comparator<Transaction>() {

					@Override
					public int compare(Transaction o1, Transaction o2) {
						return o1.getDate().compareTo(o2.getDate());
					}
				})
				.collect(
						groupingBy(Transaction::getStockSid,
								TransSumCollector.getTransSumCollector()));

		stocks.stream()
				.filter(s -> costBasisByStockSid.containsKey(s.getSid()))
				.forEach(
						s -> s.setCostBasis(costBasisByStockSid.get(s.getSid())));

		return stocks.toArray(new Stock[stocks.size()]);
	}

	@POST
	@Path("/stock/{id}")
	@Consumes("application/json")
	public Stock updateStock(final Stock stock, @PathParam("id") final String id) {
		DynamoDBMapper mapper = DBHandler.getDBMapper();

		mapper.save(stock);

		return stock;
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

	@GET
	@Path("/portfolio")
	@Produces(MediaType.APPLICATION_JSON)
	public Portfolio[] getPortfolios() {
		DynamoDBMapper mapper = DBHandler.getDBMapper();

		DynamoDBScanExpression scanExpression = new DynamoDBScanExpression();
		List<Portfolio> portfolios = mapper.scan(Portfolio.class,
				scanExpression);
		return portfolios.toArray(new Portfolio[portfolios.size()]);
	}

	@POST
	@Path("/portfolio")
	@Consumes("application/json")
	public Portfolio updatePortfolio(final Portfolio portfolio) {
		DynamoDBMapper mapper = DBHandler.getDBMapper();

		mapper.save(portfolio);

		return portfolio;
	}

}
