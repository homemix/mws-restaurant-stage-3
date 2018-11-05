let restaurant;
var newMap;

let restaurantId;
/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1Ijoia2VubmVkeS13YW1idWEiLCJhIjoiY2prcGJncWxvMHo2bDNrcWxieWRhYWIwdSJ9.QGg57ExEaDxtsmnBl0kdHw',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 
window.addEventListener('load', () => {

  updateOnlineStatus = (event) => {
    DBHelper.updateOnlineStatus();
  }

  window.addEventListener('online',  updateOnlineStatus);
  //location.reload();
});

/**
 *  Create an element.
 */
 function createNode(el){
   return document.createElement(el);
 }
/**
 *  Append an element to the parent.
 */
 function append(parent, el) {
   return parent.appendChild(el);
 }

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    restaurantId = id;
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = DBHelper.imageSrcsetForRestaurant(restaurant);
  image.sizes = "(max-width: 320px) 300px, (max-width: 425px) 400px,(max-width: 635px) 600px, (min-width: 636px) 400px";
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  const id = parseInt(getParameterByName('id'));

  const ul = document.getElementById('reviews-list');
  let getReviews = DBHelper.fetchReviewsById(id);
  // send offline reviews to the server.
  DBHelper.updateOnlineStatus();


  let offlineReviews= DBHelper.getLocalDataByID('reviews', 'restaurant', id);
  console.log('Looking for local storedReviews: ', offlineReviews);
                      offlineReviews.then((storedReviews) => {
                      console.log('Looking for local data in offlineReviews: ',storedReviews);
                      storedReviews.reverse().forEach(review => {
                        append(ul, createReviewHTML(review));
                      });
                      append(container, ul);
                      
  }).catch((error) => {
          console.log('No reviews yet! ', error.message);
          const noReviews = createNode('p');
          noReviews.innerHTML = 'No reviews yet!';
          append(container, noReviews);
          
    });
/**
  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
   */
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');

  if (!navigator.onLine){
    const offLineStatus = createNode('p');
   offLineStatus.classList.add('offline-label');
   offLineStatus.innerHTML = "Offline";
   li.classList.add('offline-views');
   offLineStatus.setAttribute('style', 'text-align: center;');
   append(li, offLineStatus);   
 }

  const name = document.createElement('p');
  name.innerHTML = `Name: ${review.name}`;
  li.appendChild(name);

  const date = document.createElement('p');
  let dateObject = new Date(review.createdAt);
  date.innerHTML =`Date: ${dateObject.toDateString()}`;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Get Form Data 
 */ 
const formEl = document.getElementById("reviewForm");
getFormData = () => {
  // get form data Name, comment , a rate.
  const aName = document.getElementById("aname").value;
  const aComment = document.querySelector("textarea").value;
  const starList = document.getElementsByName("star");

  let aRate =1
  for (let i = 0; i < starList.length; i++) {
      if (starList[i].checked) {
          aRate = starList[i].value;
      }
  }
  const formData = {
      restaurant_id: parseInt(restaurantId),
      name: aName,
      rating: parseInt(aRate),
      comments: aComment,
      createdAt: (new Date()).getTime()
      
  };
   return formData; 
}
postReview = () => {
 event.preventDefault();
 let reviewData = getFormData();
 const container = document.getElementById('reviews-container');
 const ul = document.getElementById('reviews-list');

 if (!navigator.onLine){
   const offlineReviews = DBHelper.setLocalStorage(JSON.stringify(reviewData));
   console.log("offline reviews saved", reviewData);
 }else {

   DBHelper.addReviews(reviewData);
   console.log("update UI offLineStatus", reviewData); 
 }
 const ulNewNode = createNode('ul');
  ulNewNode.classList.add('reviewsUpdate'); 
 append(ulNewNode, createReviewHTML(reviewData));

 const titleReviews = document.getElementById('reviewsTitle');
 container.insertBefore(ulNewNode, titleReviews.nextSibling);
 document.forms["reviewForm"].reset(); 
 
 
} 


