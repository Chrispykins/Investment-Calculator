function formatMoney(number) {

	number = parseInt(number);
	if (isNaN(number)) return "$0";

	var isNegative = number < 0;
	var sections = [];

	number = Math.abs(number);
	while (number >= 1000) {
		var remainder = number % 1000;

		//add leading zeros
		if (remainder < 10) remainder = "00" + remainder;
		else if (remainder < 100) remainder = "0" + remainder;

		sections.unshift(remainder);

		number = Math.floor(number / 1000);
	}

	sections.unshift(number);

	return (isNegative ? "-$" : "$") + sections.join(",");
}