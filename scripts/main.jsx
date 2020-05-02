//start and end are strings. This function validates the strings and returns their difference.
function calculateNumYears(start, end) {
	return Math.max(0, (parseInt(end) || 0) - (parseInt(start) || 0));
}

const highestAge = 125;
function clampYear(year) {
	return Math.max(0, Math.min(highestAge, parseInt(year) || 0));
}

function debounce(func, wait) {
  	let timeout;
  	return function(event) {
  		console.log("debouncing")
  		if (event) event.persist();
  		clearTimeout(timeout);
  		timeout = setTimeout(() => { console.log("activating"); timeout = null; func(event); }, wait);
  	}
};

class App extends React.Component {

	constructor(props) {
		super(props);

		this.investment = 0;
		this.growth 	= 0;

		this.state = {
			investments: 	[],
			growths:		[],
			runningTotals: 	[],
			startingAge:	0,
			endingAge:		0,
			endingFund:		0,
			detailsShown:	false
		};

		this.recalculate 	= this.recalculate.bind(this);
		this.setInvestment 	= this.setInvestment.bind(this);
		this.setGrowth 		= this.setGrowth.bind(this);
		this.setStartingAge	= this.setStartingAge.bind(this);
		this.setEndingAge 	= this.setEndingAge.bind(this);

		this.investmentInput= React.createRef();
		this.growthInput	= React.createRef();
		this.startingInput	= React.createRef();
		this.endingInput	= React.createRef();
	}

	render() {

		console.log("\nrendering app");
		var willTakeTime = (this.state.detailsShown && this.state.investments.length >= 100);

		if (this.state.detailsShown) {
			var detailText = "Hide details";
			var details = (
				<DetailTable
					investments=	{this.state.investments}
					growths=		{this.state.growths}
					runningTotals=	{this.state.runningTotals}
					startingAge=	{this.state.startingAge}
					endingAge=		{this.state.endingAge}
				/>
			);
		}
		else {
			detailText = "Show details...";
			details = null;
		}


		return (
			<div>
				<div className="inputs">
					<span className="row">
						<label className="cell" htmlFor="AnnualInvestment">Investment Per Year: &nbsp; $</label>
						<input className="cell" id="AnnualInvestment" type="text" ref={this.investmentInput}
							onChange={this.setInvestment} />
					</span>

					<span className="row">
						<label className="cell" htmlFor="Growth">Expected Growth:</label>
						<input className="cell" id="Growth" type="text" ref={this.growthInput} 
							onChange={this.setGrowth}  />%
					</span><br />

					<span className="row">
						<label className="cell" htmlFor="StartingAge">Starting Age:</label>
						<input className="cell" id="StartingAge" type='number' min="0" max={highestAge} ref={this.startingInput}
							onChange={this.setStartingAge} />
					</span>

					<span className="row">
						<label className="cell" htmlFor="EndingAge">Ending Age:</label>
						<input className="cell" id="EndingAge" type="number" min="0" max={highestAge} ref={this.endingInput}
							onChange={this.setEndingAge} />
					</span><br />

					<span className="row" id="Result" >
						<span className="cell">Funds at age {this.state.endingAge}:</span> 
						<span className="cell">{formatMoney(this.state.endingFund)}</span>
					</span>
				</div>
				<hr />

				<h3 id="showDetails" onClick={() => this.setState({detailsShown: !this.state.detailsShown})}>{detailText}</h3>

				{details}

			</div>
		);

	}

	resetInvestments(afterUpdate) {
		var numYears = calculateNumYears(this.state.startingAge, this.state.endingAge);
		var investment = parseInt(this.investment) || 0;

		this.setState({investments: new Array(numYears).fill(investment)}, afterUpdate);
	}

	resetGrowths(afterUpdate) {
		var numYears = calculateNumYears(this.state.startingAge, this.state.endingAge);
		var growth = parseFloat(this.growth) || 0;

		this.setState({growths: new Array(numYears).fill(growth)}, afterUpdate);
	}

	//check investments array to see if all values are equal
	checkInvestmentArray() {

		if (this.state.investments.length) {

			var value = parseInt(this.state.investments[0]);
			for (var i = 1; i < this.state.investments.length; i++) {
				if (parseInt(this.state.investments[i])  != value) {
					this.investmentInput.current.value = "various";
					return;
				}
			}

			this.investmentInput.current.value = this.state.investments[0];
		}
	}

	//check growths array to see if all values are equal
	checkGrowthArray() {
		
		if (this.state.growths.length) {

			var value = parseFloat(this.state.growths[0]);
			for (var i = 1; i < this.state.growths.length; i++) {
				if (parseFloat(this.state.growths[i]) != value) {
					this.growthInput.current.value = "various";
					return;
				}
			}

			this.growthInput.current.value = this.state.growths[0];
		}
	}

	setInvestment(event) {
		this.investment = event.target.value;
		this.resetInvestments(this.recalculate);
	}

	setInvestmentSingleYear(value, year) {
		var investments = this.state.investments.slice();

		investments[year] = value;

		this.setState({investments: investments}, 
			function() {this.recalculate(); this.checkInvestmentArray(); }
		);
	}

	setGrowth(event) {
		this.growth = event.target.value;
		this.resetGrowths(this.recalculate);
	}

	setGrowthSingleYear(value, year) {
		var growths = this.state.growths.slice();

		growths[year] = value;

		calculatorApp.current.setState({growths: growths}, 
			function() {this.recalculate(); this.checkGrowthArray(); }
		);
	}

	setStartingAge(event) {
		var startingAge = clampYear(event.target.value);
		this.startingInput.current.value = startingAge;

		//add/remove entries from the start of the list
		var numYearsOld = this.state.investments.length;
		var numYearsNew = calculateNumYears(startingAge, this.state.endingAge);

		var delta = numYearsNew - numYearsOld;
		var iterations = Math.abs(delta);

		if (delta > 0) {
			var investments 	= new Array(iterations).fill(this.investment);
			var growths 		= new Array(iterations).fill(this.growth);

			this.setState({
				investments: 	  investments.concat(this.state.investments),
				growths: 		  growths.concat(this.state.growths)},
				this.recalculate
			);
		}
		else if (delta < 0) {
			this.setState({
				investments: 	  this.state.investments.slice(iterations),
				growths: 		  this.state.growths.slice(iterations)},
				this.recalculate
			);
		}

		this.setState({startingAge: startingAge}, function() {this.checkInvestmentArray(); this.checkGrowthArray()});
	}

	setEndingAge(event) {
		var endingAge = clampYear(event.target.value);
		this.endingInput.current.value = endingAge;

		//add/remove entries from the end of the list
		var numYearsOld = this.state.investments.length;
		var numYearsNew = calculateNumYears(this.state.startingAge, endingAge);

		var delta = numYearsNew - numYearsOld;
		var iterations = Math.abs(delta);

		if (delta > 0) {
			var investments 	= new Array(iterations).fill(this.investment);
			var growths 		= new Array(iterations).fill(this.growth);

			this.setState({
				investments: 	  this.state.investments.concat(investments),
				growths: 		  this.state.growths.concat(growths)},
				this.recalculate
			);
		}
		else if (delta < 0) {
			this.setState({
				investments: 	  this.state.investments.slice(0, -iterations),
				growths: 		  this.state.growths.slice(0, -iterations)},
				this.recalculate
			);
		}

		this.setState({endingAge: endingAge}, function() {this.checkInvestmentArray(); this.checkGrowthArray()});
	}


	recalculate() {
		console.log("recalculating");

		var numYears = calculateNumYears(this.state.startingAge, this.state.endingAge);

		var runningTotals = new Array(numYears);

		var sum = 0;
		if (numYears > 0) {

			for (var i = 0; i < numYears; i++) {

				var investment = parseInt(this.state.investments[i]) || 0;
				var growth     = parseFloat(this.state.growths[i])   || 0;

				sum+= investment;

				if (growth != 0) sum*= 1 + (growth/100);

				sum = parseFloat(sum.toFixed(2));

				runningTotals[i] = sum;
			}
		}

		this.setState({runningTotals: runningTotals, endingFund: sum});
	}
}

var calculatorApp = React.createRef();

ReactDOM.render(
	<App ref={calculatorApp} />,
	document.getElementById("application")
);