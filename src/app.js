App = {
    loading: false,
    accounts: [],
    contracts: {},
    load: async () => {
        console.log("app loading")
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
        App.renderTasks()
    },

    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
          App.web3Provider = window.ethereum
          web3 = new Web3(window.ethereum)
        } else {
          window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
          window.web3 = new Web3(ethereum)
          try {
            // Request account access if needed
            // Acccounts now exposed
            App.accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            // web3.eth.sendTransaction({from:App.account})
          } catch (error) {
              console.log('Could not access contract')
          }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
          App.web3Provider = window.ethereum
          window.web3 = new Web3(window.ethereum)
          // Acccounts always exposed
          web3.eth.sendTransaction({/* ... */})
        }
        // Non-dapp browsers...
        else {
          console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
      },

      loadAccount: async () => {
        App.account = App.accounts[0]  
        console.log("account")
        console.log(App.account)
      },

      loadContract: async () => {
          const todoList = await $.getJSON('TodoList.json')
          App.contracts.TodoList = TruffleContract(todoList)
          App.contracts.TodoList.setProvider(App.web3Provider)
          App.todoList = await App.contracts.TodoList.deployed()
      },

      render: async () => {

        if(App.loading){
            return
        }
        
        App.setLoading(true)
        $('#account').html(App.account)
        App.setLoading(false)
      },

      setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
          loader.show()
          content.hide()
        } else {
          loader.hide()
          content.show()
        }
      },

      renderTasks: async () => {
          const taskCount = await App.todoList.taskCount()
          const $taskTemplate = $('.taskTemplate')
          
          for(var i=1; i<= taskCount; i++){
              const task = await App.todoList.tasks(i)
              const taskId = task[0].toNumber()
              const taskContent = task[1]
              const taskCompleted = task[2]
              // Create the html for the task
              const $newTaskTemplate = $taskTemplate.clone()
              $newTaskTemplate.find('.content').html(taskContent)
              $newTaskTemplate.find('input')
                    .prop('name', taskId)
                    .prop('checked', taskCompleted)
                    .on('click', App.toggleCompleted)
              
               if (taskCompleted) {
                    $('#completedTaskList').append($newTaskTemplate)
                } else {
                    $('#taskList').append($newTaskTemplate)
                }

                // Show the task
                $newTaskTemplate.show()
            }
        },
    
    createTask: async () => {
        App.setLoading(true)
        const content = $("#newTask").val()
        await App.todoList.createTask(content, {from: App.account})
        window.location.reload()
    },
    
    toggleCompleted: async (e) => {
        App.setLoading(true)
        const taskId = e.target.name
        await App.todoList.toggleCompleted(taskId, {from: App.account})
        window.location.reload()
    }
}
$(() => {
    $(window).load(() => {
        App.load()
    })
})