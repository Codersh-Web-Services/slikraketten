
// Reactive State | global store
const store = Vue.reactive( {
	state: {
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
	calculateCartTotal ()
	{
		this.state.mainCart.total = 0;
		// calculate the total 
		this.state.mainCart.bags.map( ( bag ) =>
		{
			this.state.mainCart.total += bag.total;
		} );
	},
	updatePricesAndWeights ()
	{
		this.state.bottomCart.total = 0;
		this.state.bottomCart.weight = 0;
		store.state.currentbagitems.length = 0;
		this.state.filteredProducts.map( product =>
		{
			let totalPrice = Number( product.variants[ 0 ].price ) * product.keepcounter;
			let totalWeight = Number( product.variants[ 0 ].grams ) * product.keepcounter;
			this.state.bottomCart.total += totalPrice;
			this.state.bottomCart.weight += totalWeight;
			if ( product.keepcounter > 0 )
			{
				product.added = true;
				store.state.currentbagitems.unshift( {

					image: product.images[ 0 ].src,
					title: product.title,
					weight: product.variants[ 0 ].grams * product.keepcounter,
					orginalWeight: product.variants[ 0 ].grams,
					id: product.variants[ 0 ].id,
					desc: product.desc,
					price: product.variants[ 0 ].price,
					orginalAmount: product.amount,
					amount: product.amount * product.keepcounter,
					qty: product.keepcounter,
					productId: product.id,
					increaseQuantity ()
					{
						this.qty++;
						this.amount = this.orginalAmount * this.qty;
						this.weight = this.orginalWeight * this.qty;
						store.state.filteredProducts.map( ( product, i ) =>
						{
							if ( product.id == this.productId )
							{
								product.keepcounter = this.qty;
							}
						} );
						store.updatePricesAndWeights();

					},
					decreaseQuantity ()
					{
						if ( this.qty > 1 )
						{
							this.qty--;
							this.amount = this.orginalAmount * this.qty;
							this.weight = this.orginalWeight * this.qty;
							store.state.filteredProducts.map( ( product, i ) =>
							{
								if ( product.id == this.productId )
								{
									product.keepcounter = this.qty;
								}
							} );
							store.updatePricesAndWeights();

						} else
						{
							this.qty--;

							store.state.filteredProducts.map( ( product, i ) =>
							{
								if ( product.id == this.productId )
								{
									product.keepcounter = this.qty;
								}
							} );
							store.state.currentbagitems.map( ( el, i ) =>
							{
								el.productId == this.productId ? store.state.currentbagitems.splice( i, 1 ) : false;
							} );

							store.updatePricesAndWeights();

						}
					},
					removeProduct ()
					{
						this.qty = 0;
						store.state.filteredProducts.map( ( product, i ) =>
						{
							if ( product.id == this.productId )
							{
								product.keepcounter = this.qty;
							}
						} );
						store.updatePricesAndWeights();

						store.state.currentbagitems.map( ( el, i ) =>
						{
							el.productId == this.productId ? store.state.currentbagitems.splice( i, 1 ) : false;
						} );
					},
					mtoggle ()
					{
						store.mtoggle( this.productId );
					}
				} );
			}
			else
			{
				product.added = false;
			}

		} );
	},
	// fetch products from collection 
	getProducts ()
	{
		axios.get( '/collections/frontpage/products.json' )
			.then( ( response ) =>
			{
				console.log( "second" );

				response.data.products.forEach( element =>
				{
					let { body_html: desc, title, variants, images, vendor, tags, id } = element;
					this.state.filteredProducts.unshift( { desc, title, id, variants, images, vendor, tags, show: true, keepcounter: 0, added: false } );
					this.state.products.unshift( { desc, id, title, variants, images, vendor, tags, show: true, keepcounter: 0, added: false } );
				} );
			} )
			.then( () =>
			{
				// fetching products from the localStorage


				// do the update to the product data 
				let bagsfromStorage = JSON.parse( localStorage.bags || '[]' );
				// initialize the bag recreation
				bagsfromStorage.forEach( ( storedBags ) =>
				{
					storedBags.bags.forEach( ( item ) =>
					{
						store.state.filteredProducts.forEach( ( filterProduct ) =>
						{
							if ( item.id == filterProduct.variants[ 0 ].id )
							{
								filterProduct.added = true;
								filterProduct.keepcounter = item.qty;
							}
						} );
					} );
					store.updatePricesAndWeights();
					this.setBag( storedBags.bagName, false );
				} );


			} )
			.catch( error =>
				console.log( error ) );
	},
	// bag mutations
	setBag ( bagName, shouldUpdateLocalStore = true )
	{

		let newBag = [];
		store.state.currentbagitems.map( item =>
		{
			newBag.push( {
				title: item.title,
				orginalWeight: item.orginalWeight,
				orginalAmount: item.orginalAmount,
				price: item.price,
				image: item.image, qty: item.qty,
				weight: item.weight,
				amount: item.amount,
				productId: item.productId,
				id: item.id,
				increaseQuantity ()
				{
					this.qty++;
					this.amount = this.orginalAmount * this.qty;
					this.weight = this.orginalWeight * this.qty;
					store.state.mainCart.total += Number( this.price );
					store.state.editBag.total += Number( this.price );

					store.state.filteredProducts.map( ( product, i ) =>
					{
						if ( product.id == this.productId )
						{
							product.keepcounter = this.qty;
						}
					} );
					store.updatePricesAndWeights();
					store.state.mainCart.bags.forEach( bag =>
					{
						if ( bag.bagName == bagName )
						{
							bag.total = store.state.bottomCart.total;
						}
					} );
					store.updateLocalStore();

				}
				,
				decreaseQuantity ()
				{
					if ( this.qty > 1 )
					{
						this.qty--;
						this.amount = this.orginalAmount * this.qty;
						this.weight = this.orginalWeight * this.qty;

						store.state.mainCart.total -= Number( this.price );
						store.state.editBag.total -= Number( this.price );

						store.state.filteredProducts.map( ( product, i ) =>
						{
							if ( product.id == this.productId )
							{
								product.keepcounter = this.qty;
							}
						} );
						store.updatePricesAndWeights();

						store.state.mainCart.bags.forEach( bag =>
						{
							if ( bag.bagName == bagName )
							{
								bag.total = store.state.bottomCart.total;
							}
						} );
						store.updateLocalStore();


					} else
					{
						this.qty--;
						this.amount = this.orginalAmount * this.qty;
						this.weight = this.orginalWeight * this.qty;
						store.state.mainCart.total -= Number( this.price );
						store.state.editBag.total -= Number( this.price );
						store.state.editBag.editProducts.map( ( el, i ) =>
						{
							el.productId == this.productId ? store.state.editBag.editProducts.splice( i, 1 ) : false;
						} );
						store.state.filteredProducts.map( ( product, i ) =>
						{
							if ( product.id == this.productId )
							{
								product.keepcounter = this.qty;
							}
						} );

						store.updatePricesAndWeights();

						store.state.mainCart.bags.forEach( bag =>
						{
							if ( bag.bagName == bagName )
							{
								if ( bag.bags.length == 1 )
								{
									store.state.mainCart.bags.splice( 0, 1 );
								} else
								{
									bag.bags.map( ( product, i ) =>
									{
										product.productId == this.productId ? bag.bags.splice( i, 1 ) : false;
									} );
								}


								bag.total = store.state.bottomCart.total;

							}
						} );
						store.updateLocalStore();



					}
				},
				removeItem ()
				{
					store.state.mainCart.total -= Number( this.price ) * this.qty;
					store.state.editBag.total -= Number( this.price ) * this.qty;
					this.qty = 0;
					store.state.filteredProducts.map( ( product, i ) =>
					{
						if ( product.id == this.productId )
						{
							product.keepcounter = this.qty;
						}
					} );
					store.state.editBag.editProducts.map( ( el, i ) =>
					{
						el.productId == this.productId ? store.state.editBag.editProducts.splice( i, 1 ) : false;
					} );
					store.state.mainCart.bags.map( bag =>
					{
						if ( bagName == bag.bagName )
						{
							bag.bags.map( ( el, i ) =>
							{
								if ( bag.bags.length == 1 )
								{
									store.state.mainCart.bags.splice( 0, 1 );
								} else
								{
									el.productId == this.productId ? bag.bags.splice( i, 1 ) : false;
								}
							} );
						}
					} );
					store.updatePricesAndWeights();

					store.calculateCartTotal();
					store.updateLocalStore();

				},
			} );
		} );

		this.state.mainCart.bags.forEach( ( bag, i ) =>
		{
			if ( bag.bagName == bagName )
			{
				this.state.mainCart.bags.splice( i, 1 );

			}
		} );

		this.state.mainCart.bags.push( {
			bagName, bags: newBag, total: this.state.bottomCart.total, editBag ()
			{
				store.editBag( bagName );
			}
		} );

		let prevmodal = new bootstrap.Modal( '#CloseBag' );
		prevmodal._hideModal();
		let modal = new bootstrap.Modal( '#Slide-Left' );
		modal.toggle();
		store.calculateCartTotal();
		store.updateLocalStore( shouldUpdateLocalStore );

	},

	editBag ( bagName )
	{
		this.state.editBag.bagName = bagName;
		this.state.mainCart.bags.map( ( bag, i ) =>
		{
			if ( bag.bagName == bagName )
			{
				this.state.editBag.editProducts = ( [ ...bag.bags ] );

				store.state.filteredProducts.map( ( product ) =>
				{
					product.keepcounter = 0;

				} );
				bag.bags.forEach( bagProduct =>
				{
					store.state.filteredProducts.map( ( product ) =>
					{
						if ( product.id == bagProduct.productId )
						{
							product.keepcounter = bagProduct.qty;
						}
					} );
				} );
				this.state.editBag.total = bag.total;

				store.updatePricesAndWeights();
			}
		} );

	},
	removeBag ( bagName )
	{
		let updates = {};

		this.state.mainCart.bags.map( ( bag, i ) =>
		{

			if ( bagName == bag.bagName )
			{
				bag.bags.forEach( item =>
				{
					updates[ item.id ] = 0;
				} );
				this.state.mainCart.total -= bag.total;
				this.state.mainCart.bags.splice( i, 1 );
			}
		} );
		this.state.filteredProducts.forEach( product => product.keepcounter = 0 );
		store.updatePricesAndWeights();

		store.updateLocalStore();
	},
	mtoggle ( productID )
	{
		this.state.filteredProducts.map( product =>
		{
			if ( product.id == productID )
			{
				this.state.modalData.currentProductInfo = product.desc;
				this.state.modalData.currentProductImg = product.images[ 0 ].src;
				this.state.modalData.currentProductTitle = product.title;
			}
		} );


		let modal = new bootstrap.Modal( '#InfoModal' );
		modal.toggle();
	},
	updateLocalStore ( shouldUpdateLocalStore = true )
	{
		// push the bags to localStorage
		if ( shouldUpdateLocalStore )
		{

			localStorage.bags = JSON.stringify( store.state.mainCart.bags );
		}
	},

} );



// App Vue

if ( document.querySelector( '#bags-container' ) )
{

	const BagsContainer = Vue.createApp( {
		// add a delimiter to replace shopify's liquid output syntax
		delimiters: [ '${', '}' ],
		data ()
		{
			return {
				acceptterms: false,
				data: {
					details: store.state.bottomCart,
					bags: store.state.currentbagitems,
					modalData: store.state.modalData,
					bagName: "",
					tbagName: false
				},
				mainCart: store.state.mainCart,
				editBag: store.state.editBag
			};
		},

		watch: {
			// check the correct bagName ie check for name validations 
			'data.bagName' ( newValue )
			{
				let trimmedBag = this.data.bagName.trim();
				this.data.tbagName = Boolean( trimmedBag ) ? true : false;
			}
		},
		methods: {

			putInBasket ()
			{
				// Set the current bag 
				store.setBag( this.data.bagName );
				// after the bags are set remove the currentbag items using pop
			},
			removeBag ( bag )
			{
				store.removeBag( bag );
			},


			backToBasket ()
			{
				let prevmodal = new bootstrap.Modal( '#Slide-Left-Second' );
				prevmodal._hideModal();

			},
			addMoreCandy ()
			{
				let prevmodal = new bootstrap.Modal( '#Slide-Left-Second' );
				prevmodal._hideModal();
				let prevmodal2 = new bootstrap.Modal( '#Slide-Left' );
				prevmodal2._hideModal();

			},

			checkOut ()
			{
				let finalCheckoutData = {
					items: []
				};
				store.state.mainCart.bags.map( ( currentBag ) =>
				{
					currentBag.bags.map( ( orderProduct ) =>
					{
						finalCheckoutData.items.unshift( {
							id: orderProduct.id,
							quantity: orderProduct.qty,
							properties: {
								'Bag Name': currentBag.bagName
							}
						} );
					} );
				} );
				axios.post( '/cart/clear.js' ).then( ( response ) =>
				{
					console.log( response );

					axios.post( '/cart/add.js', finalCheckoutData ).then( ( response ) =>
					{
						console.log( response );
						window.location.pathname = "/checkout";

					} ).catch( ( er ) =>
					{
						console.log( er );
					} );
				} );
			}
		}

	} ).mount( '#bags-container' );

}
if ( document.querySelector( '#product-box' ) )
{

	const productbox = Vue.createApp( {
		delimiters: [ '${', '}' ],
		data: function ()
		{
			return {
				products: store.state.filteredProducts,
				filterNames: [ "Chocolate", "Marshmallow", "peanuts", "Sugarfree" ],
				bags: store.state.currentbagitems,
			};
		},
		created ()
		{
			( async () =>
			{
				await store.getProducts();
			} )();
		},


	} );
	productbox.component( 'filter-component',
		{
			template: '#filter-component',
			delimiters: [ '${', '}' ],
			props: [ 'name' ],
			data: function ()
			{
				return {
					selected: false
				};
			},
			methods: {
				filterProducts ()
				{
					this.selected = !this.selected;

					store.state.filteredProducts.map( ( el, i ) =>
					{
						// store.state.filteredProducts[ i ].show = false;
						if ( this.selected == false )
						{

						}
						for ( let tag of el.tags )
						{
							if ( tag == this.name.toLowerCase() )
							{
								if ( this.selected == false )
								{
									store.state.filteredProducts[ i ].show = false;

								} else
								{

									store.state.filteredProducts[ i ].show = true;
								}
								break;
							}
						}
					} );
				}
			}
		} );
	productbox.component( 'product-component', {
		template: '#product-component',
		delimiters: [ '${', '}' ],

		props: [ 'image', "title", "vendor", "desc", "id", "weight", "price", "tags", "show", "productid", "keepcounter", "added" ],
		data ()
		{
			return {
				amount: 0,
			};
		},
		mounted ()
		{
			this.tags.map( ( el, i ) =>
			{
				if ( el.split( "__" )[ 0 ] == "amount" )
				{
					this.amount = el.split( "__" )[ 1 ];
				}
			} );
			store.state.filteredProducts.map( product =>
			{
				if ( product.id == this.productid )
				{
					product.amount = this.amount;
				}
			} );

		},

		methods: {
			increaseQuantity ()
			{
				store.state.filteredProducts.map( ( product, i ) =>
				{
					if ( product.id == this.productid )
					{
						product.keepcounter++;
					}
				} );
				store.state.currentbagitems.map( ( el, i ) =>
				{
					el.title == this.title ?
						store.state.currentbagitems[ i ].weight = this.keepcounter * this.weight : false;
					el.title == this.title ?
						store.state.currentbagitems[ i ].amount = Number( this.amount ) * Number( this.keepcounter ) : false;
					el.title == this.title ?
						store.state.currentbagitems[ i ].qty = Number( this.keepcounter ) : false;
				} );

				store.updatePricesAndWeights();

			},
			decreaseQuantity ()
			{
				if ( this.keepcounter == 1 )
				{
					store.state.currentbagitems.map( ( el, i ) =>
					{
						el.title == this.title ? store.state.currentbagitems.splice( i, 1 ) : false;
					} );
					store.state.filteredProducts.map( ( product, i ) =>
					{
						if ( product.id == this.productid )
						{
							product.keepcounter = 0;
							product.added = false;
						}
					} );
				} else
				{
					store.state.filteredProducts.map( ( product, i ) =>
					{
						if ( product.id == this.productid )
						{
							product.keepcounter--;
						}
					} );
				}


				store.state.currentbagitems.map( ( el, i ) =>
				{
					el.title == this.title ?
						store.state.currentbagitems[ i ].weight = this.keepcounter * this.weight : false;
					el.title == this.title ?
						store.state.currentbagitems[ i ].amount = Number( this.amount ) * Number( this.keepcounter ) : false;
					el.title == this.title ?
						store.state.currentbagitems[ i ].qty = Number( this.keepcounter ) : false;
				} );

				store.updatePricesAndWeights();

			},
			// modal trigger
			mtoggle ()
			{
				store.mtoggle( this.productid );
			},
			putInBag ()
			{

				store.state.filteredProducts.map( ( product, i ) =>
				{
					if ( product.id == this.productid )
					{
						product.keepcounter++;
						product.added = true;
					}
				} );

				store.updatePricesAndWeights();

			}
		}
	} );
	productbox.mount( "#product-box" );
}

const header = Vue.createApp( {
	delimiters: [ '${', '}' ],
	data: function ()
	{
		return {
			bags: store.state.mainCart.bags,
			currentbagsid: "currentbagsid"
		};
	},
} ).mount( "#navbar" );