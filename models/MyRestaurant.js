const MyRestaurant = function (json) {
    this.name = json.name;
    this.rating = json.rating;
    this.image_url = json.image_url;
    this.price = json.price;
    this.url = json.url;
    this.phone = json.display_phone;
    this.categories = json.categories.map(category => category.title);
    this.address = json.location.address1 + (json.location.address2 ? `\n${json.location.address2}` : '');
    this.city = json.location.city;
    this.state = json.location.state;
    this.zip = json.location.zip_code;
}

module.exports = MyRestaurant;