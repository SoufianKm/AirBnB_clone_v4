document.ready(function () {
    const amenities = {};
    const states = {};
    const cities = {};

    $(".amenities .popover li input[type=checkbox]").change(function () {
	if (this.checked) {
	    amenities[this.dataset.name] = this.dataset.id;
	} else {
	    delete amenities[this.dataset.name];
	}
	$(".amenities h4").text(Object.keys(amenities).sort().join(", "));
    });

    $(".locations .popover li h2 input[type=checkbox]").change(function () {
        if (this.checked) {
            states[this.dataset.name] = this.dataset.id;
        } else {
            delete states[this.dataset.name];
        }
        $(".locations h4").text(Object.keys(states).sort().join(", "));
    });

    $(".locations .popover li ul li input[type=checkbox]").change(function () {
        if (this.checked) {
            cities[this.dataset.name] = this.dataset.id;
        } else {
            delete cities[this.dataset.name];
        }
        $(".locations h4").text(Object.keys(cities).sort().join(", "));
    });

    // get status of API
    $.getJSON("http://0.0.0.0:5001/api/v1/status/", (data) => {
	if (data.status === "OK") {
	    $("div#api_status").addClass("available");
	} else {
	    $("div#api_status").removeClass("available");
	}
    });

    // fetch data about places
    $.post({
	url: `${HOST}/api/v1/places_search`,
	data: JSON.stringify({
          amenities: Object.values(amenities),
          states: Object.values(states),
          cities: Object.values(cities)
        }),
	headers: {
	    "Content-Type": "application/json",
	},
	success: (data) => {
	    data.forEach((place) =>
		$("section.places").append(
                       `<article>
                        <div class="title_box">
                        <h2>${place.name}</h2>
                        <div class="price_by_night">$${place.price_by_night}</div>
                        </div>
                        <div class="information">
                        <div class="max_guest">${place.max_guest} Guest${
                                                place.max_guest !== 1 ? "s" : ""
                                        }</div>
                        <div class="number_rooms">${place.number_rooms} Bedroom${
                                                place.number_rooms !== 1 ? "s" : ""
                                        }</div>
                        <div class="number_bathrooms">${place.number_bathrooms} Bathroom${
                                                place.number_bathrooms !== 1 ? "s" : ""
                                        }</div>
                        </div>
                        <div class="description">
                        ${place.description}
                        </div>
                        <div class="reviews">
                        <h2>
                        <span id="${place.id}_count" class="count_review">Reviews</span>
                        <span id="${place.id}" onclick="toggleReviews(this)">Show</span>
                        </h2>
                        <ul id="${place.id}_item"></ul>
                        </div>
                                </article>`
		)
	    );
	},
	dataType: "json",
    });

    function toggleReviews (obj) {
      if (obj === undefined) {
        return;
      }
      if (obj.textContent === 'Show') {
        obj.textContent = 'Hide';
        $.get(`http://0.0.0.0:5001/api/v1/places/${obj.id}/reviews`, (data, textStatus) => {
          if (textStatus === 'success') {
            if (data.length <= 1)
            {
              $(`#${obj.id}_count`).html(data.length + ' Review');
            } else {
              $(`#${obj.id}_count`).html(data.length + ' Reviews');
            }
            for (const review of data) {
              printReview(review, obj);
            }
          }
        });
      } else {
        obj.textContent = 'Show';
        $(`#${obj.id}_count`).html('Reviews');
        $(`#${obj.id}_item`).empty();
      }
    }

    // search places
    $(".filters button").bind("click", searchPlace);
    searchPlace();
    toggleReviews();
});
