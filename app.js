$(document).ready( function() {
	$('.unanswered-getter').submit( function(event){
		getResults($(this), 'getUnanswered');
	});
	$('.inspiration-getter').submit( function(event){
		getResults($(this), 'getAnswerers');
	});
});

var getResults = function(formElem, functionName) {
	// clear previous results
	$('.results').html('');
	// get form input
	var tags = formElem.find("input[name='tags']").val();
	// call function to fetch and show the results
	window[functionName](tags);
}

// this function takes the question object returned by StackOverflow
// and creates new result to be appended to DOM
var showQuestion = function(question) {

	// clone our result template code
	var result = $('.templates .question').clone();

	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the #views for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
													question.owner.display_name +
												'</a>' +
							'</p>' +
							'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};


// this function takes the answerer object returned by StackOverflow
// and creates new result to be appended to DOM
var showAnswerer = function(answerer) {

	// clone our result template code
	var result = $('.templates .answerer').clone();

	// -- image
	var imageElem = result.find('.answerer-image');
	imageElem.css('background-image', 'url(' + answerer.user.profile_image + ')');

	// -- name
	var nameElem = result.find('.name-text a');
	nameElem.attr('href', answerer.user.link);
	nameElem.text(answerer.user.display_name);

	// -- reputation
	var reputation = result.find('.reputation span');
	reputation.text(answerer.user.reputation);

	// -- post-count
	var post_count = result.find('.post-count span');
	post_count.text(answerer.post_count);

	// -- score
	var score = result.find('.score span');
	score.text(answerer.score);

	return result;
};


// this function takes the results object from StackOverflow
// and creates info about search results to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query;
	return results;
};

var ajaxFailHandler = function(jqXHR, error, errorThrown) {
	var errorElem = showError(error);
	$('.search-results').append(errorElem);
});

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {

	// the parameters we need to pass in our request to StackOverflow's API
	var request = {tagged: tags,
								site: 'stackoverflow',
								order: 'desc',
								sort: 'creation'};

	$.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",
		type: "GET",
		})
	.done(function(result){
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);

		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(ajaxFailHandler);
};

// takes a tag to be searched for on StackOverflow
var getAnswerers = function(tag) {

	// the parameters we need to pass in our request to StackOverflow's API
	var request = { site: 'stackoverflow' };

	$.ajax({
		url: "http://api.stackexchange.com/2.2/tags/" + tag + "/top-answerers/all_time",
		data: request,
		dataType: "jsonp",
		type: "GET",
		})
	.done(function(result){
		var tag = $('#answerers-tag').val();
		var searchResults = showSearchResults(tag, result.items.length);

		$('.search-results').html(searchResults);

		$.each(result.items, function(i, item) {
			var answerer = showAnswerer(item);
			$('.results').append(answerer);
		});
	})
	.fail(ajaxFailHandler);
};





