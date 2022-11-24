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
		modalData: {
			currentProductInfo: "hello"
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
					let { body_html: desc, title, variants, url, images, vendor } = element
					this.state.products.unshift({ desc, title, variants, url, images, vendor })

				});
				this.state.products.push()
				console.log(this.state.products)
			})
			.catch(error =>
				console.log(error))
	},


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


// App 

if (document.querySelector('#bags-container')) {

	const collectionContainer = Vue.createApp({
		delimiters: ['${', '}'],
		data() {
			return {
				data: {
					details: store.state.bottomCart,
					bags: store.state.bags,
					modalData: store.state.modalData
				}
			}
		},
		methods: {

		}

	}).mount('#bags-container')



}
if (document.querySelector('#product-box')) {

	const productbox = Vue.createApp({
		delimiters: ['${', '}'],
		data: function () {
			return {
				product_sub: "From vendor",
				products: store.state.products
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

		props: ['image', 'url', "variants", "title", "vendor", "desc", "id", "weight", "price"],
		data() {
			return {
				counter: 0,
				added: false,
			}
		},

		methods: {
			increaseQuantity() {
				this.counter += 1
				store.state.bottomCart.total += Number(this.price)
				store.state.bottomCart.weight += this.weight
			},
			decreaseQuantity() {
				if (this.counter == 1) {
					this.added = false
				}
				this.counter -= 1
				store.state.bottomCart.total -= Number(this.price)
				store.state.bottomCart.weight -= this.weight


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
				store.state.bags.unshift({
					image: this.image,
					title: this.title,
					weight: this.weight
				})
			}
		}
	})
	productbox.mount("#product-box")
}