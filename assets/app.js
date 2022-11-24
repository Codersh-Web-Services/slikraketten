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
        products: []

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
        console.log("first")
        axios.get('/collections/frontpage/products.json')
            .then((response) => {
                response.data.products.forEach(element => {
                    this.state.products.unshift(element)

                });
                this.state.products.push()
            })
            .catch(error =>
                console.log(error))
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


// App 

if (document.querySelector('#bags-container')) {

    const collectionContainer = Vue.createApp({
        delimiters: ['${', '}'],
        data() {
            return {
                data: {
                    details: store.state.bottomCart
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
            })()
        },
        methods: {

        }
    })

    productbox.component('product-component', {
        template: '#product-component',
        delimiters: ['${', '}'],

        props: ['image', 'url', "variant", "title", "vendor"],
        data() {
            return {
                counter: 0,
                added: false,
                weight: 20,
                price: 5
            }
        },
        methods: {
            increaseQuantity() {
                this.counter += 1
                store.state.bottomCart.total += this.price
                store.state.bottomCart.weight += this.weight

            },
            decreaseQuantity() {
                if (this.counter == 1) {
                    this.added = false
                }
                this.counter -= 1
                store.state.bottomCart.total -= this.price
                store.state.bottomCart.weight -= this.weight


            },
            putInBag() {
                this.counter += 1
                this.added = true

                store.state.bottomCart.total += this.price
                store.state.bottomCart.weight += this.weight


            }

        }
    })


    productbox.mount("#product-box")
}