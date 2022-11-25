// Reactive State 
const store = Vue.reactive({
	state: {
		cartState: [],
		bottomCart: {
			total: 0,
			weight: 0,
		},
		bags: [],
		currentbagitems: [],
		products: [],
		filteredProducts: [],
		modalData: {
			currentProductInfo: "Hello there? General kenobi"
		}
	},

	getCart() {
		axios.get('/cart.js')
			.then(response => {
				this.state.cartState.unshift(response.data)
			})
			.catch(error => {
				console.log(error)
			})
	},
	getProducts() {
		axios.get('/collections/frontpage/products.json')
			.then((response) => {
				response.data.products.forEach(element => {
					let { body_html: desc, title, variants, url, images, vendor, tags } = element
					this.state.products.unshift({ desc, title, variants, url, images, vendor, tags })
					this.state.filteredProducts.unshift({ desc, title, variants, url, images, vendor, tags })
				});
			})
			.catch(error =>
				console.log(error))
	},
	setBag(bagName) {
		console.log(this.state.currentbagitems, bagName)
		alert("Got the all currentbag items for " + bagName)
	}


})

const miniCartState = Vue.reactive({
	hidden: true
})

const toggleMiniCart = {
	openCart() {
		miniCartState.hidden = !miniCartState.hidden
		menuState.hidden = true
	}
}


// App Vue

if (document.querySelector('#bags-container')) {

	const BagsContainer = Vue.createApp({
		delimiters: ['${', '}'],
		data() {
			return {
				data: {
					details: store.state.bottomCart,
					bags: store.state.currentbagitems,
					modalData: store.state.modalData,
					bagName: "Jamie's bag"
				}
			}
		},
		methods: {
			putInBasket() {
				store.setBag(this.bagName)
				// after the bags are set remove the currentbag items 
			}
		}

	}).mount('#bags-container')

}
if (document.querySelector('#product-box')) {

	const productbox = Vue.createApp({
		delimiters: ['${', '}'],
		data: function () {
			return {
				product_sub: "From vendor",
				products: store.state.filteredProducts
			}
		},
		created() {
			(async () => {
				await store.getProducts()
				console.log(this.products)
			})()
		},
		methods: {

		}
	})

	productbox.component('product-component', {
		template: '#product-component',
		delimiters: ['${', '}'],

		props: ['image', "title", "vendor", "desc", "id", "weight", "price", "tags"],
		data() {
			return {
				counter: 0,
				added: false,
				amount: 0
			}
		},
		mounted() {
			this.tags.map((el, i) => {
				if (el.split("__")[0] == "amount") {
					this.amount = el.split("__")[1]
				}
			})

		},

		methods: {
			increaseQuantity() {
				this.counter += 1
				store.state.bottomCart.total += Number(this.price)
				store.state.bottomCart.weight += this.weight
				store.state.currentbagitems.map((el, i) => {
					el.title == this.title ?
						store.state.currentbagitems[i].weight = this.counter * this.weight : false
					el.title == this.title ?
						store.state.currentbagitems[i].amount = Number(this.amount) * Number(this.counter) : false
					el.title == this.title ?
						store.state.currentbagitems[i].qty = Number(this.counter) : false


				})
			},
			decreaseQuantity() {
				if (this.counter == 1) {
					this.added = false
					store.state.currentbagitems.map((el, i) => {
						el.title == this.title ? store.state.currentbagitems.splice(i, 1) : false
					})


				}
				this.counter -= 1
				store.state.bottomCart.total -= Number(this.price)
				store.state.bottomCart.weight -= this.weight
				store.state.currentbagitems.map((el, i) => {
					el.title == this.title ?
						store.state.currentbagitems[i].weight = this.counter * this.weight : false
					el.title == this.title ?
						store.state.currentbagitems[i].amount = Number(this.amount) * Number(this.counter) : false
					el.title == this.title ?
						store.state.currentbagitems[i].qty = Number(this.counter) : false
				})
			},
			mtoggle() {
				store.state.modalData.currentProductInfo = this.desc
				store.state.modalData.currentProductImg = this.image
				store.state.modalData.currentProductTitle = this.title

				let modal = new bootstrap.Modal('#productInfo')
				modal.toggle()
			},

			putInBag() {
				this.counter += 1
				this.added = true

				store.state.bottomCart.total += Number(this.price)
				store.state.bottomCart.weight += this.weight
				store.state.currentbagitems.unshift({
					image: this.image,
					title: this.title,
					weight: this.weight,
					amount: this.amount,
					qty: this.counter

				})
			}
		}
	})
	productbox.mount("#product-box")
}