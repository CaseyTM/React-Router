 // Instantiate a map

 var mapOptions = {
	zoom:7,
	center:{lat:39.8282, lng: -98.5795},
};

var map = new google.maps.Map(
	document.getElementById('map'),
	mapOptions
);



// Globals



var markers = [];
var infoWindow = new google.maps.InfoWindow({});
var directionsDisplay = new google.maps.DirectionsRenderer();
var directionsService = new google.maps.DirectionsService();
var poiMarkers = [];


directionsDisplay.setMap(map);
directionsDisplay.setPanel(document.getElementById('directionsPanel'));


function calcRoute() {
	var request = {
		origin: start,
		destination: end,
		travelMode: 'DRIVING'
	};
	directionsService.route(request, function(result, status) {
		if (status == 'OK') {
		  directionsDisplay.setDirections(result);
		}
	});
}
  var start = 'Atlanta, GA'
  var end;

function createMarker(city){
	var icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2%7CFE7569'
	var cityLL = {
		lat: city.lat,
		lng: city.lon
	}
	var marker = new google.maps.Marker({
		position: cityLL,
		map: map,
		title: city.city,
		icon: icon,
		animation: google.maps.Animation.DROP
	});
	google.maps.event.addListener(marker, 'click', function(){
		infoWindow.setContent(`<h2> ${city.city}</h2><div>${city.state}</div><div>${city.yearEstimate}</div><a href="">Click to zoom</a>`);
		infoWindow.open(map, marker);
	});
	markers.push(marker);
}

function createPoI(place){
	// console.log(place)
	var infoWindow = new google.maps.InfoWindow({});
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location,
		icon: place.icon
	});
	google.maps.event.addListener(marker, 'click', () =>{
		infowindow.setcontent(place.name);
		infowindow.open(map, marker);
	});
	poiMarkers.push(marker);
}



// REACT PORTION //



var GoogleCity = React.createClass({
	getDirections: function(){
		end = this.props.cityObject.city;
		calcRoute();
	},

	handleClickedCity: function(event){
		google.maps.event.trigger(markers[this.props.cityObject.yearRank-1], "click");
	},

	zoomToCity: function(event){
		var cityLL = new google.maps.LatLng(this.props.cityObject.lat, this.props.cityObject.lon)
		map = new google.maps.Map(
			document.getElementById('map'),
			{
				zoom: 10,
				center: cityLL
			}
		)
		var service = new google.maps.places.PlacesService(map);
		service.nearbySearch(
		{
			location: cityLL,
			radius: 500,
			type: ['store']
		},
		function(results, status){
				if(status === 'OK'){
					results.map(function(currPlace, index){
					createPoI(currPlace);
					})
				}
			}
		);
		var bounds = new google.maps.LatLngBounds(cityLL);
		poiMarkers.map(function(currMarker, index){
			bounds.extend(currMarker.getPosition());
		})
			map.fitBounds(bounds);
	},

	render: function(){
		return(
			<tr>
				<td className="city-name" onClick={this.handleClickedCity}>{this.props.cityObject.city}</td>
				<td className="city-rank">{this.props.cityObject.yearRank}</td>
				<td><button className="btn btn-primary" onClick={this.getDirections}>Get Directions</button></td>
				<td><button className="btn btn-success" onClick={this.zoomToCity}>Zoom</button></td>
			</tr>
		)
	}
});



var Cities = React.createClass({
	getInitialState: function(){
		return{
			currCities: this.props.routes[1].cities
		}
	},

	setStartingLocation: function(event){
		start = event.target.value
	},

	getDirections: function(){
		end = this.props.cityObject.city;
		calcRoute()
	},

	handleInputChange: function(event){
		var newFilterValue = event.target.value;
		var filteredCitiesArray = [];
		this.props.cities.routes[1].map(function(currCity, index){
			if(currCity.city.indexOf(newFilterValue) !== -1){
				filteredCitiesArray.push(currCity);
			}
		});
		this.setState({
			currCities: filteredCitiesArray
		})
		console.log(filteredCitiesArray);
	},

	updateMarkers: function(event){
		event.preventdefault();
		markers.map(function(marker, index){
			marker.setMap(null)
		});
		this.state.currCities.map(function(city, index){
			createMarker(city)
		})
	},

	render: function(){	
		var cityRows = [];
		this.state.currCities.map(function(currentCity, index){
			createMarker(currentCity);
			cityRows.push(<GoogleCity cityObject={currentCity} key={index} />)
		});
		return(
			<div>
				<form onSubmit={this.updateMarkers}>
					<input type="text" onChange={this.handleInputChange}/>
					<input type="submit" value ="Update Markers" />
				</form>
				<form>
					<input type="text" placeholder="Start Here" onChange={this.setStartingLocation} />
				</form>
				<table>
					<thead>
						<tr>
							<th>City Name</th>
							<th>City Rank</th>
						</tr>
					</thead>
					<tbody>
						{cityRows}
					</tbody>
				</table>
			</div>
		)
	}
});


function Test(props){
    return(
        <h1>This is the Test route</h1>
    )
}

var App = React.createClass({
	render: function(){
		return(
			<div>
				<BootstrapNavBar />
				{this.props.children}
			</div>
		)
	}
});

var BootstrapNavBar = React.createClass({
	render: function (){
		return(
			<nav className="navbar navbar-default">
				<div className="container-fluid">
					<div className="navbar-header">
				  		<a className="navbar-brand" href="#">WebSiteName</a>
					</div>
					<ul className="nav navbar-nav">
				  		<li><ReactRouter.IndexLink activeClassName="active" to="/">Home</ReactRouter.IndexLink></li>
				  		<li><ReactRouter.Link activeClassName="active" to="cities">Cities</ReactRouter.Link></li>
					</ul>
			  	</div>
			</nav>
		)
	}
});

ReactDOM.render(
	<ReactRouter.Router>
		<ReactRouter.Route path="/" component={App} >
			<ReactRouter.IndexRoute component={Cities} cities={cities} />
			<ReactRouter.Route path="/cities" component={Test} />
		</ReactRouter.Route>
	</ReactRouter.Router>,
	document.getElementById('cities-container')
)