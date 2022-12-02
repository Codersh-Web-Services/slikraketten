// Shallow Reactive State

// const store = Vue.shallowReactive({
// 	state: {
// 		currentbagitems: [],
// 	}
// })

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
			bags: [],
		},
		bags: [],
		currentbagitems: [],
		products: [],
		filteredProducts: [],
		modalData: {
			currentProductInfo: "Hello there? General kenobi"
		},
		editBag: {
			bagName: "",
			total: 0,
			editProducts: []
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
	updatePricesAndWeights() {
		this.state.bottomCart.total = 0
		this.state.bottomCart.weight = 0

		this.state.filteredProducts.map(product => {
			let totalPrice = Number(product.variants[0].price) * product.keepcounter
			let totalWeight = Number(product.variants[0].grams) * product.keepcounter
			console.log(totalPrice, totalWeight)
			this.state.bottomCart.total += totalPrice
			this.state.bottomCart.weight += totalWeight
		})
	},
	// fetch products from collection 
	getProducts() {
		axios.get('/collections/frontpage/products.json')
			.then((response) => {
				response.data.products.forEach(element => {
					let { body_html: desc, title, variants, images, vendor, tags, id } = element
					this.state.filteredProducts.unshift({ desc, title, id, variants, images, vendor, tags, show: true, keepcounter: 0 })
					this.state.products.unshift({ desc, id, title, variants, images, vendor, tags, show: true, keepcounter: 0 })
				});
			})
			.catch(error =>
				console.log(error))
	},
	// bag mutations
	setBag(bagName) {
		let newBag = []
		store.state.currentbagitems.map(item => {
			newBag.push({
				title: item.title,
				orginalWeight: item.orginalWeight,
				orginalAmount: item.orginalAmount,
				price: item.price,
				image: item.image, qty: item.qty,
				weight: item.weight,
				amount: item.amount,
				productId: item.productid,
				id: item.id,
				increaseQuantity() {
					this.qty++
					this.amount = this.orginalAmount * this.qty
					this.weight = this.orginalWeight * this.qty
					store.state.bottomCart.total += Number(this.price)
					store.state.bottomCart.weight += this.orginalWeight

				}
				,
				decreaseQuantity() {
					if (this.qty > 1) {
						this.qty--
						this.amount = this.orginalAmount * this.qty
						this.weight = this.orginalWeight * this.qty
						store.state.bottomCart.total -= Number(this.price)
						store.state.bottomCart.weight -= this.orginalWeight

					} else {
						this.qty--
						store.state.editBag.editProducts.map((el, i) => {
							el.productId == this.productId ? store.state.editBag.editProducts.splice(i, 1) : false
						})

					}
				},
				removeItem() {
					store.state.editBag.editProducts.map((el, i) => {
						el.productId == this.productId ? store.state.editBag.editProducts.splice(i, 1) : false
					})
				},
			})
		})
		this.state.mainCart.bags.push({
			bagName, bags: newBag, total: this.state.bottomCart.total, editBag() {
				store.editBag(bagName)
			}
		})
		let prevmodal = new bootstrap.Modal('#CloseBag')
		prevmodal._hideModal()
		let modal = new bootstrap.Modal('#Slide-Left')
		modal.toggle()
		// calculate the total 
		this.state.mainCart.bags.map((bag) => {
			this.state.mainCart.total += bag.total
		})
	},
	editBag(bagName) {
		this.state.editBag.bagName = bagName

		this.state.mainCart.bags.map((bag, i) => {
			if (bag.bagName == bagName) {
				this.state.editBag.editProducts = ([...bag.bags])
			}
		})
	},
	removeBag(bagName) {
		this.state.mainCart.bags.map((bag, i) => {
			console.log(bagName, bag.bagName)

			if (bagName == bag.bagName) {
				console.log(bagName)
				this.state.mainCart.total -= bag.total
				this.state.mainCart.bags.splice(i, 1)
			}
		})
	},
	mtoggle(productID) {
		this.state.filteredProducts.map(product => {
			if (product.id == productID) {
				this.state.modalData.currentProductInfo = product.desc
				this.state.modalData.currentProductImg = product.images[0].src
				this.state.modalData.currentProductTitle = product.title
			}
		})


		let modal = new bootstrap.Modal('#InfoModal')
		modal.toggle()
	},
})



// App Vue
const header = Vue.createApp({
	delimiters: ['${', '}'],
	data() {
		return {
			weekend: Date()
		}
	}
}).mount('#anouncementbar')
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
				mainCart: store.state.mainCart,
				editBag: store.state.editBag
			}
		},
		methods: {
			putInBasket() {
				store.setBag(this.bagName)
				// after the bags are set remove the currentbag items using pop
			},
			removeBag(bag) {
				store.removeBag(bag)
			},

			backToBasket() {
				let prevmodal = new bootstrap.Modal('#Slide-Left-Second')
				prevmodal._hideModal()

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

		props: ['image', "title", "vendor", "desc", "id", "weight", "price", "tags", "show", "productid", "keepcounter"],
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
				store.state.currentbagitems.map((el, i) => {
					el.title == this.title ?
						store.state.currentbagitems[i].weight = this.counter * this.weight : false
					el.title == this.title ?
						store.state.currentbagitems[i].amount = Number(this.amount) * Number(this.counter) : false
					el.title == this.title ?
						store.state.currentbagitems[i].qty = Number(this.counter) : false
				})
				store.state.filteredProducts.map((product, i) => {
					if (product.id == this.productid) {
						product.keepcounter = this.counter
					}
				})
				store.updatePricesAndWeights()

			},
			decreaseQuantity() {
				if (this.counter == 1) {
					this.added = false
					store.state.currentbagitems.map((el, i) => {
						el.title == this.title ? store.state.currentbagitems.splice(i, 1) : false
					})
				}
				this.counter -= 1

				store.state.currentbagitems.map((el, i) => {
					el.title == this.title ?
						store.state.currentbagitems[i].weight = this.counter * this.weight : false
					el.title == this.title ?
						store.state.currentbagitems[i].amount = Number(this.amount) * Number(this.counter) : false
					el.title == this.title ?
						store.state.currentbagitems[i].qty = Number(this.counter) : false
				})
				store.state.filteredProducts.map((product, i) => {
					if (product.id == this.productid) {
						product.keepcounter = this.counter
					}
				})
				store.updatePricesAndWeights()

			},
			mtoggle() {
				console.log(this.productid + " from the component")
				store.mtoggle(this.productid)
			},

			putInBag() {
				this.counter += 1
				this.added = true
				store.state.filteredProducts.map((product, i) => {
					if (product.id == this.productid) {
						product.keepcounter = this.counter
					}
				})
				store.updatePricesAndWeights()

				store.state.filteredProducts.map((product, i) => {
					if (product.id == this.productid) {
						product.keepcounter = this.counter
					}
				})
				store.state.currentbagitems.unshift({

					image: this.image,
					title: this.title,
					weight: this.weight,
					orginalWeight: this.weight,
					id: this.id,
					desc: this.desc,
					price: this.price,
					orginalAmount: this.amount,
					amount: this.amount,
					qty: this.counter,
					productId: this.productid,
					increaseQuantity() {
						this.qty++
						this.amount = this.orginalAmount * this.qty
						this.weight = this.orginalWeight * this.qty
						store.state.filteredProducts.map((product, i) => {
							if (product.id == this.productId) {
								product.keepcounter = this.qty
							}
						})
						store.updatePricesAndWeights()

					},
					decreaseQuantity() {
						if (this.qty > 1) {
							this.qty--
							this.amount = this.orginalAmount * this.qty
							this.weight = this.orginalWeight * this.qty
							store.state.filteredProducts.map((product, i) => {
								if (product.id == this.productId) {
									product.keepcounter = this.qty
								}
							})
							store.updatePricesAndWeights()

						} else {
							this.qty--

							store.state.filteredProducts.map((product, i) => {
								if (product.id == this.productId) {
									product.keepcounter = this.qty
								}
							})
							store.state.currentbagitems.map((el, i) => {
								el.productId == this.productId ? store.state.currentbagitems.splice(i, 1) : false
							})

							store.updatePricesAndWeights()



						}
					},
					removeProduct() {
						store.state.currentbagitems.map((el, i) => {
							el.productId == this.productId ? store.state.currentbagitems.splice(i, 1) : false
						})
					},
					mtoggle() {
						store.mtoggle(this.productId)
					}
				})
			}
		}
	})
	productbox.mount("#product-box")
}