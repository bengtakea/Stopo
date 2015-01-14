package se.velocius;

import java.util.EnumSet;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.function.BinaryOperator;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collector;

import se.velocius.model.Transaction;

public class TransSumCollector<T extends Transaction> implements
		Collector<Transaction, double[], Double> {

	@Override
	public BiConsumer<double[], Transaction> accumulator() {
		return (acc, t) -> {
			String type = t.getType();
			if (type.equals("buy")) {
				acc[1] += t.costDelta();
			} else if (type.equals("sell")) {
				double sellShare = t.getShares() / acc[0];
				acc[1] *= (1 - sellShare);
			}
			acc[0] += t.delta();
		};
	}

	@Override
	public Set<java.util.stream.Collector.Characteristics> characteristics() {
		return EnumSet.noneOf(Characteristics.class);
	}

	@Override
	public BinaryOperator<double[]> combiner() {
		return (acc, t) -> {
			throw new UnsupportedOperationException("Combining not possible");
		};
	}

	@Override
	public Function<double[], Double> finisher() {
		return (acc) -> acc[1];
	}

	@Override
	public Supplier<double[]> supplier() {

		return () -> new double[2];
	}

	public static <T extends Transaction> TransSumCollector<T> getTransSumCollector() {
		return new TransSumCollector<T>();
	}
}
