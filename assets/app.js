if (document.querySelector('#collection-page-container')) {

    const collectionContainer = Vue.createApp({
        delimiters: ['${', '}'],
        data() {
            return {

                data: {
                    id: 44040886911277,
                    quantity: 1
                }

            }
        },
        created() {
        }
        ,
        methods: {
            addtobag(event) {
                event.preventDefault()
                let data = this.data
                console.log(data)
                // axios.post('/cart/add.js', data)
                //     .then((response) => {
                //         console.log(response)
                //     })
                //     .catch(errors => console.log(errors))
            }
        }

    }).mount('#collection-page-container')



}
if (document.querySelector('#product-box')) {

    const productbox = Vue.createApp({
        delimiters: ['${', '}'],
        data: function () {
            return {
                product_sub: "From vendor",
                products: {}
            }
        },
        created() {
            axios.get('collections/frontpage/products.json')
                .then((response) => {
                    this.products = response.data.products
                    console.log(response)
                    console.log("this.products", this.products)
                })
                .catch(error =>
                    console.log(error))


        }
    })

    productbox.component('product-component', {
        template: '#product-component',
        delimiters: ['${', '}'],

        props: ['image', 'url', "variant", "title"],
        data() {
            return {
                counter: 1,
                added: 0
            }
        }
    })


    productbox.mount("#product-box")
}