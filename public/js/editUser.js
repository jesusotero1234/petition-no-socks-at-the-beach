exports.showUserInEditProfile = ({
    firstName,
    lastName,
    email,
    age,
    city,
    url
}) => {
    $('input[name="firstName"]').val(firstName)
    $('input[name="lastName"]').val(lastName);
    $('input[name="email"]').val(email);
    $('input[name="age"]').val(age);
    $('input[name="city"]').val(city);
    $('input[name="url"]').val(url);
};
