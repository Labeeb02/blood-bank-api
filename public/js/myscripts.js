console.log('Client side javascript file is loaded')

const donor_from = document.getElementById('donor_form');
const d_name = document.getElementById('d_name');
const d_email = document.getElementById('d_email');
const d_aadhar = document.getElementById('d_aadhar');
const d_weight = document.getElementById('d_weight');
const d_height = document.getElementById('d_height');
const d_bloodgroup = document.getElementById('d_bloodgroup');
const d_city = document.getElementById('d_city');
const d_phone = document.getElementById('d_phone');
const d_gender = document.getElementById('d_gender');
const d_age = document.getElementById('d_age');

const recepient_from = document.getElementById('recepient_form');
const r_name = document.getElementById('r_name');
const r_email = document.getElementById('r_email');
const r_aadhar = document.getElementById('r_aadhar');
const r_phone = document.getElementById('r_phone');
const r_gender = document.getElementById('r_gender');
const r_age = document.getElementById('r_age');
const r_bloodgroup = document.getElementById('r_bloodgroup');
const r_city = document.getElementById('r_city');



donor_form.addEventListener('submit' , (e) => {
    e.preventDefault()
    
    console.log("now hgere");

    fetchURL="/addDonor?name="+encodeURIComponent(d_name.value)
    +"&aadhar="+d_aadhar.value
    +"&email="+d_email.value
    +"&weight="+d_weight.value
    +"&height="+d_height.value
    +"&bloodgroup="+encodeURIComponent(d_bloodgroup.value)
    +"&city="+encodeURIComponent(d_city.value.toLowerCase())
    +"&phone="+encodeURIComponent(d_phone.value)
    +"&gender="+d_gender.value
    +"&age="+d_age.value;
    
    
    d_name.value=null
    d_aadhar.value=null
    d_email.value=null
    d_bloodgroup.value='A+'
    d_city.value=null
    d_age.value=null
    d_phone.value=null
    d_gender.value='M'
    d_height.value=null
    d_weight.value=null

    fetch(fetchURL).then((response) => {
      response.text().then(function (text) {
        // console.log(text);
        if(text=='Error')
        {
          window.location.href = "/err";
          // console.log('In Error');
        }
        else
        {
          // console.log('In Donor');
          window.location.href = "/reg_status?name=Donor";
        }
      });
    })
})

recepient_form.addEventListener('submit' , (e) => {
  e.preventDefault()

  fetchURL="/addRecepient?name="+encodeURIComponent(r_name.value)
  +"&aadhar="+r_aadhar.value
  +"&email="+r_email.value
  +"&bloodgroup="+encodeURIComponent(r_bloodgroup.value)
  +"&city="+encodeURIComponent(r_city.value.toLowerCase())
  +"&phone="+encodeURIComponent(r_phone.value)
  +"&age="+r_age.value
  +"&gender="+r_gender.value;
  
  r_name.value=null
  r_aadhar.value=null
  r_email.value=null
  r_bloodgroup.value='A+'
  r_city.value=null
  r_phone.value=null
  r_age.value=null
  r_gender.value='M'
  fetch(fetchURL).then((response) => {
    response.text().then(function (text) {
      console.log(text)
      if(text=='Error')
      {
        window.location.href = "/err";
        
      }
      else
      {
        window.location.href = "/reg_status?name=Recipient";
        
      }
    });
  })
  
})

window.onscroll = () => {
    const nav = document.querySelector('#navbar');
    if(this.scrollY <= 10) nav.className = ''; else nav.className = 'scroll';
  }


const signUpButton = document.getElementById('signUp');

const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

var x=0;


signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});

fetch('/donor_check?name=Donor',()=>{

})
console.log('fet6ched');
