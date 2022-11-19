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
            axios.get()
        }
        ,
        methods: {
            addtobag(event) {
                event.preventDefault()
                let data = this.data
                console.log(data)
                axios.post('/cart/add.js', data)
                    .then((response) => {
                        console.log(response)
                    })
                    .catch(errors => console.log(errors))
            }
        }

    }).mount('#collection-page-container')
}