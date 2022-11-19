if (document.querySelector('#collection-page-container')) {

    const collectionContainer = Vue.createApp({
        delimiters: ['${', '}'],
        data() {
            return {
                test: 'test'
            }
        }

    }).mount('#collection-page-container')
}