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
                .then((response) => this.products = response.data)
                .catch(error =>
                    console.log(error))


        }
    }).mount("#product-box")
}