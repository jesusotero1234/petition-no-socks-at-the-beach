

//when Submit is clicked
$('button').on('click',()=>{

    //get values of the inputs

    //first name
    const firstName = $('input[name="first"]').val()
    
    //last name
    const lastName = $('input[name="last"]').val()


    //signature
    const signature = $('input[name="signature"]').val()
    
    //condition to send to the DB

    if(firstName.trim().length>0 && lastName.trim().length>0 && signature.trim().length>0){
        console.log('All conditions passed')
    }

})



