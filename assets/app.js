// Reactive State 
const store = Vue.reactive({
	state: {
		cartState: [],
		bottomCart: {
			total: 0,
			weight: 0,
		},
		mainCart: {
			total: 0,
			bags: []

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
					this.state.products.unshift({ desc, title, variants, url, images, vendor, tags, show: true })
					this.state.filteredProducts.unshift({ desc, title, variants, url, images, vendor, tags, show: true })
				});
			})
			.catch(error =>
				console.log(error))
	},
	setBag(bagName) {
		console.log(this.state.currentbagitems, bagName)
		this.state.mainCart.bags.push({ bagName, bags: this.state.currentbagitems, total: this.state.bottomCart.total })
		let prevmodal = new bootstrap.Modal('#CloseBag')
		prevmodal._hideModal()
		let modal = new bootstrap.Modal('#Slide-Left')
		modal.toggle()
	}
})



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
				},
				mainCart: {
					bags: store.state.mainCart.bags
				}
			}
		},
		methods: {
			putInBasket() {
				store.setBag(this.bagName)
				// after the bags are set remove the currentbag items using pop
			},
			removeBag() {
				// store.removeBag(this.bagId)
			},
			checkOut() {
				finalCheckoutData = {
					items: []
				}
				store.state.mainCart.bags.map((currentBag) => {
					currentBag.bags.map((orderProduct) => {
						finalCheckoutData.items.unshift({
							id: orderProduct.id,
							quantity: orderProduct.qty,
							properties: {
								'Bag Name': currentBag.bagName
							}
						})
					})
				})
				console.log(finalCheckoutData)
				axios.post('/cart/add.js', finalCheckoutData).then((response) => {
					console.log(response)
					window.location.pathname = "/checkout"

				}).catch((er) => {
					console.log(er)
				})
			}
		}

	}).mount('#bags-container')

}
if (document.querySelector('#product-box')) {

	const productbox = Vue.createApp({
		delimiters: ['${', '}'],
		data: function () {
			return {
				products: store.state.filteredProducts,
				filterNames: ["Chocolate", "Resic", "peanuts", "Sugarfree"]
			}
		},
		created() {
			(async () => {
				await store.getProducts()
				console.log(this.products)
			})()
		},

	})
	productbox.component('filter-component', {
		template: '#filter-component',
		delimiters: ['${', '}'],
		props: ['name'],
		data: function () {
			return {
			}
		},
		methods: {
			filterProducts() {

				store.state.filteredProducts.map((el, i) => {
					store.state.filteredProducts[i].show = false
					for (let tag of el.tags) {
						if (tag == this.name.toLowerCase()) {
							store.state.filteredProducts[i].show = true
							break
						}
					}
				})
			}
		}
	})
	productbox.component('product-component', {
		template: '#product-component',
		delimiters: ['${', '}'],

		props: ['image', "title", "vendor", "desc", "id", "weight", "price", "tags", "show"],
		data() {
			return {
				counter: 0,
				added: false,
				amount: 0,

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
					id: this.id,
					amount: this.amount,
					qty: this.counter

				})
			}
		}
	})
	productbox.mount("#product-box")
}