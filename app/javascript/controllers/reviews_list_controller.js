import { Controller } from "stimulus";
import Rails from "@rails/ujs";

export default class extends Controller {
  static targets = ['form', 'reviews', 'content', 'count'];
  connect() {
    console.log('Hello!');
    this.formTarget.style.height = 0;
    this.formTarget.style.overflow = "hidden";
    this.formTarget.style.transition = 'height 0.5s';
  }

  openModal(event) {
    this.formTarget.style.height = "160px";
    event.currentTarget.style.display = "none";
  }

  submitReview(event) {
    event.preventDefault();
    // send HTTP POST request to Rails controller (reviews#create)
    // fetch()
    const url = window.location.pathname + '/reviews';
    // "restaurants/5" + "/reviews" => "restaurants/5/reviews"
    Rails.ajax({
      url:url,
      type: 'post',
      data: `review[content]=${this.contentTarget.value}`,
      success: (data) => {
        console.log(data);
        this.reviewsTarget.insertAdjacentHTML('afterBegin', data.reviewHTML);
        this.contentTarget.value = ""; // resetting the input field
        this.countTarget.innerText = `${data.count} reviews`; // updating the reviews count
      }
    });
    // retrieve the review info from Rails controller
    // add a review in the DOM
  }
}
