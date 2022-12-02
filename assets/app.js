
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
	calculateCartTotal() {
		this.state.mainCart.total = 0
		// calculate the total 
		this.state.mainCart.bags.map((bag) => {
			this.state.mainCart.total += bag.total
		})
	},
	updatePricesAndWeights() {
		this.state.bottomCart.total = 0
		this.state.bottomCart.weight = 0
		store.state.currentbagitems.length = 0
		this.state.filteredProducts.map(product => {
			let totalPrice = Number(product.variants[0].price) * product.keepcounter
			let totalWeight = Number(product.variants[0].grams) * product.keepcounter
			console.log(totalPrice, totalWeight)
			this.state.bottomCart.total += totalPrice
			this.state.bottomCart.weight += totalWeight
			if (product.keepcounter > 0) {
				product.added = true
				store.state.currentbagitems.unshift({

					image: product.images[0].src,
					title: product.title,
					weight: product.variants[0].grams * product.keepcounter,
					orginalWeight: product.variants[0].grams,
					id: product.variants[0].id,
					desc: product.desc,
					price: product.variants[0].price,
					orginalAmount: product.amount,
					amount: product.amount * product.keepcounter,
					qty: product.keepcounter,
					productId: product.id,
					increaseQuantity() {
						this.qty++
						console.log(this.amount)

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
						this.qty = 0
						store.state.filteredProducts.map((product, i) => {
							if (product.id == this.productId) {
								product.keepcounter = this.qty
							}
						})
						store.updatePricesAndWeights()

						store.state.currentbagitems.map((el, i) => {
							el.productId == this.productId ? store.state.currentbagitems.splice(i, 1) : false
						})
					},
					mtoggle() {
						store.mtoggle(this.productId)
					}
				})
			}
			else {
				product.added = false
			}

		})
	},
	// fetch products from collection 
	getProducts() {
		axios.get('/collections/frontpage/products.json')
			.then((response) => {
				response.data.products.forEach(element => {
					let { body_html: desc, title, variants, images, vendor, tags, id } = element
					this.state.filteredProducts.unshift({ desc, title, id, variants, images, vendor, tags, show: true, keepcounter: 0, added: false })
					this.state.products.unshift({ desc, id, title, variants, images, vendor, tags, show: true, keepcounter: 0, added: false })
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
				productId: item.productId,
				id: item.id,
				increaseQuantity() {
					this.qty++
					this.amount = this.orginalAmount * this.qty
					this.weight = this.orginalWeight * this.qty
					store.state.mainCart.total += Number(this.price)
					store.state.filteredProducts.map((product, i) => {
						if (product.id == this.productId) {
							product.keepcounter = this.qty
						}
					})
					store.updatePricesAndWeights()
					store.state.mainCart.bags.forEach(bag => {
						console.log("the bag name is " + bagName)
						if (bag.bagName == bagName) {
							bag.total = store.state.bottomCart.total
						}
					})
				}
				,
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
						store.state.mainCart.total -= Number(this.price)

						store.state.mainCart.bags.forEach(bag => {
							console.log("the bag name is " + bagName)
							if (bag.bagName == bagName) {
								bag.total = store.state.bottomCart.total
							}
						})
						store.state.mainCart.bags.map(bag => {
							if (bagName == bag.bagName) {
								bag.bags.map((el, i) => {
									if (bag.bags.length == 1) {
										store.state.mainCart.bags.splice(0, 1)
									} else {
										el.productId == this.productId ? bag.bags.splice(i, 1) : false
									}
								})
							}
						})
						store.updatePricesAndWeights()

					} else {
						this.qty--
						store.state.editBag.editProducts.map((el, i) => {
							el.productId == this.productId ? store.state.editBag.editProducts.splice(i, 1) : false
						})
						store.state.mainCart.total -= Number(this.price)

						store.state.mainCart.bags.forEach(bag => {
							if (bag.bagName == bagName) {
								bag.total = store.state.bottomCart.total
							}
						})
						store.state.filteredProducts.map((product, i) => {
							if (product.id == this.productId) {
								product.keepcounter = this.qty
							}
						})

						store.updatePricesAndWeights()
					}
				},
				removeItem() {
					this.qty--
					store.state.filteredProducts.map((product, i) => {
						if (product.id == this.productId) {
							product.keepcounter = this.qty
						}
					})
					store.state.editBag.editProducts.map((el, i) => {
						el.productId == this.productId ? store.state.editBag.editProducts.splice(i, 1) : false
					})
					store.state.mainCart.bags.map(bag => {
						if (bagName == bag.bagName) {
							bag.bags.map((el, i) => {
								if (bag.bags.length == 1) {
									store.state.mainCart.bags.splice(0, 1)
								} else {
									el.productId == this.productId ? bag.bags.splice(i, 1) : false
								}
							})
						}
					})
					store.updatePricesAndWeights()

					store.calculateCartTotal()
				},
			})
		})

		this.state.mainCart.bags.forEach((bag, i) => {
			if (bag.bagName == bagName) {
				this.state.mainCart.bags.splice(i, 1)

			}
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
		store.calculateCartTotal()
	},
	editBag(bagName) {
		this.state.editBag.bagName = bagName

		this.state.mainCart.bags.map((bag, i) => {
			if (bag.bagName == bagName) {
				this.state.editBag.editProducts = ([...bag.bags])
				store.state.filteredProducts.map((product) => {
					product.keepcounter = 0

				})
				bag.bags.forEach(bagProduct => {
					store.state.filteredProducts.map((product) => {
						if (product.id == bagProduct.productId) {
							product.keepcounter = bagProduct.qty
						}
					})
				})
				store.updatePricesAndWeights()
			}
		})
	},
	removeBag(bagName) {
		this.state.mainCart.bags.map((bag, i) => {

			if (bagName == bag.bagName) {
				console.log(bagName)
				this.state.mainCart.total -= bag.total
				this.state.mainCart.bags.splice(i, 1)
			}
		})
		this.state.filteredProducts.forEach(product => product.keepcounter = 0)
		store.updatePricesAndWeights()

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
				axios.post('/cart/clear.js').then((response) => {
					console.log(response)

					axios.post('/cart/add.js', finalCheckoutData).then((response) => {
						console.log(response)
						window.location.pathname = "/checkout"

					}).catch((er) => {
						console.log(er)
					})
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

		props: ['image', "title", "vendor", "desc", "id", "weight", "price", "tags", "show", "productid", "keepcounter", "added"],
		data() {
			return {
				counter: 0,
				amount: 0,

			}
		},
		mounted() {
			this.tags.map((el, i) => {
				if (el.split("__")[0] == "amount") {
					this.amount = el.split("__")[1]
				}
			})
			store.state.filteredProducts.map(product => {
				if (product.id == this.productid) {
					product.amount = this.amount
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

			}
		}
	})
	productbox.mount("#product-box")
}