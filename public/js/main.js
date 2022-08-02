// *** querySelectorAll section ***
// select html elements by class
const deleteBtn = document.querySelectorAll('.fa-trash')
const item = document.querySelectorAll('.item span')
const itemCompleted = document.querySelectorAll('.item span.completed')

// Attach eventListeners to the above selected elements
// Every deleteBtn will callback to the deleteItem function
Array.from(deleteBtn).forEach((element)=>{
    element.addEventListener('click', deleteItem)
})

Array.from(item).forEach((element)=>{
    element.addEventListener('click', markComplete)
})

Array.from(itemCompleted).forEach((element)=>{
    element.addEventListener('click', markUnComplete)
})

// *** function definitions section ***
// async function as we are going to need to await a fetch API request
async function deleteItem(){
    // Find out what was clicked which will be passed to the backend in the body of the request to choose what to delete
    const itemText = this.parentNode.childNodes[1].innerText
    try{
        // await a fetch request to the backend, needs to wait so response can be populated
        // fetch(resource, options) will allow specifying the http method delete which the backend will respond to on the /deleteItem route
        const response = await fetch('deleteItem', {
            method: 'delete',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              'itemFromJS': itemText
            })
          })
        // since the above awaited response will have value and can be conveted from json
        const data = await response.json()
        // echo the extracted (from json format) data to the console as a debugging helper
        console.log(data)
        // force the browser to refresh the page which will reload the data with the deleted item missing
        location.reload()

    }catch(err){
        // if any of the async functions fail this error should be displayed
        console.log(err)
    }
}

// invokes a put http request to the /markComplete route, then forces a reload of the page to re-request updated data
async function markComplete(){
    // find out what item needs to be changed, to be passed as arguemtn in the body of the request
    const itemText = this.parentNode.childNodes[1].innerText
    try{
        const response = await fetch('markComplete', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                'itemFromJS': itemText
            })
          })
        const data = await response.json()
        console.log(data)
        location.reload()

    }catch(err){
        console.log(err)
    }
}

// partner function to markComplete
async function markUnComplete(){
    const itemText = this.parentNode.childNodes[1].innerText
    try{
        const response = await fetch('markUnComplete', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                'itemFromJS': itemText
            })
          })
        const data = await response.json()
        console.log(data)
        location.reload()

    }catch(err){
        console.log(err)
    }
}
