## Stimulus livecode

### Add an inline modal

#### The view

```
# app/views/restaurants/show.html.erb

<div data-controller="review-list">
      <h2>
        <%= pluralize @restaurant.reviews.size, "review" %>
      </h2>
        <button class="btn btn-primary" data-action="click->review-list#openModal">Leave a review</button>
        <%= simple_form_for([ @restaurant, @review ], remote: true, data: {target: "review-list.form"}) do |f| %>
          <%= f.input :content, as: :text, label: false } %>
          <%= f.submit "I'm done", class:"btn btn-primary" %>
        <% end %>

        [...]
```

#### The JS

```

# app/javascript/controller/review_list_controller.js

import { Controller } from "stimulus";
import Rails from "@rails/ujs";

export default class extends Controller {
  static targets = [ 'form' ];

  connect() {
    console.log('Hello!');
    this.formTarget.style.height = 0;
    this.formTarget.style.overflow = "hidden";
    this.formTarget.style.transition = 'height 0.5s';
  }

  openModal = (event) => {
    this.formTarget.style.height = '160px';
    event.currentTarget.style.display = 'none';
  }
}
```

### Make the form submit really reactive! 

#### The views

```
# app/views/restaurants/show.html.erb

<div data-controller="review-list">
      <h2 data-target="review-list.count">
        <%= pluralize @restaurant.reviews.size, "review" %>
      </h2>
        <button class="btn btn-primary" data-action="click->review-list#openModal">Leave a review</button>
        <%= simple_form_for([ @restaurant, @review ], remote: true, data: {target: "review-list.form"}) do |f| %>
          <%= f.input :content, as: :text, label: false, input_html: { data: { target: "review-list.content"} } %>
          <%= f.submit "I'm done", class:"btn btn-primary", data: { action: "click->review-list#submitReview"} %>
        <% end %>


        <div id="reviews" class="my-5" data-target="review-list.reviews">
          <% if @restaurant.reviews.blank? %>
          <div class="text-secondary">
            Be the first to leave a review for <%= @restaurant.name %>
          </div>
          <% else %>
            <% @restaurant.reviews.order(created_at: :desc).each do |review| %>
              <p class="p-3 mb-1 bg-white" ><%= review.content %></p>
            <% end %>
          <% end %>
        </div>
      </div>
```

```
# app/views/reviews/_card.html.erb

<p class="p-3 mb-1 bg-white" ><%= review.content %></p>
```

#### The JS

```
import { Controller } from "stimulus";
import Rails from "@rails/ujs";

export default class extends Controller {
  static targets = [ 'form', 'reviews', 'count', 'content' ];

  [...]

  submitReview = (event) => {
    event.preventDefault();
    const url = window.location.pathname + '/reviews';
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
  }
}
```

#### The controller

```
# app/controllers/reviews_controller.rb

def create
    @restaurant = Restaurant.find(params[:restaurant_id])
    @review = Review.new(review_params)
    @review.restaurant = @restaurant
    if @review.save
      respond_to do |format|
        # format.html { redirect_to restaurant_path(@restaurant) }
        format.json do
          render json: {
            count: @restaurant.reviews.count,
            review: @review,
            reviewHTML: render_to_string(
              partial: 'reviews/card',
              locals: { review: @review },
              formats: :html
            )
          }
        end
      end
    else
      render 'restaurants/show'
    end
  end
  ```
