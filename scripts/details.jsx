class DetailRow extends React.Component {

	constructor(props) {
		super(props);

		this.setInvestment  = this.setInvestment.bind(this);
		this.setGrowth 		= this.setGrowth.bind(this);

		this.investmentInput = React.createRef();
		this.growthInput	 = React.createRef();
	}

	render() {
		return (
			<span className="row">
				<span className="cell age">{this.props.age}</span>

				<span className="cell investment">
					<input type="text" 
						onChange={(event) => this.setInvestment(event.target.value, this.props.rowNumber)} 
						ref={this.investmentInput}
						value={this.props.investment}
					/>
				</span>

				<span className="cell growth">
					<input type="text" 
						onChange={(event) => this.setGrowth(event.target.value, this.props.rowNumber)} 
						ref={this.growthInput}
						value={this.props.growth}
					/>%
				</span>

				<span className={"cell total" + (this.props.last ? " last" : "")}>{this.props.runningTotal}</span>
			</span>
		);;
	}

	setInvestment(value, index) {
		if (calculatorApp.current) calculatorApp.current.setInvestmentSingleYear(value, index);
	}

	setGrowth(value, index) {
		if (calculatorApp.current) calculatorApp.current.setGrowthSingleYear(value, index);
	}
}

class DetailTable extends React.Component {
	
	constructor(props) {
		super(props);

	}

	render() {
		console.log("rendering table");
		var numYears = calculateNumYears(this.props.startingAge, this.props.endingAge);

		var start = parseInt(this.props.startingAge) || 0;

		this.rows = [];
		for (var i = 0; i < numYears; i++) {

			this.rows.push(
				<DetailRow 
					age=		{start + i}
					investment=	{this.props.investments[i]} 
					growth=		{this.props.growths[i]} 
					runningTotal={formatMoney(this.props.runningTotals[i])} 
					key=		{start + i}
					rowNumber=	{i}
					last=		{i === numYears - 1}
				/>
			);
		}

		return (
			<div id="Details">
				<span className="row header">
					<span className="cell age">Age</span>
					<span className="cell investment">Investment each year</span>
					<span className="cell growth">Growth each year</span>
					<span className="cell total">Running total</span>
				</span>

				{this.rows}
			</div>
		);
	}
}