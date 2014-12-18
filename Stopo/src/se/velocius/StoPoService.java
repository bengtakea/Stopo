package se.velocius;

import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import se.velocius.model.Stock;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
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
}
