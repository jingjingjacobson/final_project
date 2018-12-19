var rootUrl = "http://comp426.cs.unc.edu:3001/";
var itinerary_id;
var flight;
var found_seat = false;
var itin_email = "";
var todays_date = get_date();

$(document).ready(() => {
    
    $('#reg_btn').on('click', () =>{
        let usern = $('#login_user').val();
        let pass = $('#login_pass').val();
        
        $.ajax(rootUrl + 'users', 
        {
            type: 'POST',
            dataType: 'json',
            data: {
                "user": {
                    "username": usern,
                    "password": pass
                },
            },
            success: () => {
                alert("it worked!");
            },
            error: () => {
                alert("sad");
            }
        });
    });
    
    $('#login_btn').on('click', () => {
	
        let usern = $('#login_user').val();
        let pass = $('#login_pass').val();
	
	   $.ajax(rootUrl + 'sessions', 
        {
            type: 'POST',
            dataType: 'json',
            data: {
                "user": {
                    "username": usern,
                    "password": pass
                },
            },
		   success: () => {
               build();
		   },
		   error: () => {
		       alert('login error');
		   }
	   });
    });

    $("body").on("click", "#edit", function() {
        build_edit();
    });
    $("body").on("click", "#edit2", function() {
        build_edit();
    });
    $("body").on("click", "#edit3", function() {
        build_edit();
    });

    $("body").on("click", "#buy", function() {
        back_to_search_home();
    });

    $("body").on("click", "#get_itinerary", function() {
        let email = $("#itinerary_email").val().toLowerCase();
        itin_email = email;
        $.ajax(rootUrl + "itineraries?" + "filter[email]=" + email,
        {
            type: "GET",
            dataType: "json",
            xhrFields: {withCredentials: true},
            success: (response) =>  {
                let itineraries_array = response;
                
                if(itineraries_array.length >0) {
                    $("body").empty();
                    $("body").append("<span class='button_header'></span>");
                    $(".button_header").append("<button id='edit3'>Edit Flights</button><br><button class='home'>Go Back</button>");
                    $("body").append("<h1 id='itin_h1'>Itineraries</h1>");
               //     $("body").append("<button class='home'>Go Back</button>");
                //    $("body").append("<button id='edit3'>Edit Flights</button>");
                    $("body").append("<div class='itinerary_div'></div>");
                    for(i=0; i<itineraries_array.length; i++) {
                        itinerary_name = itineraries_array[i].info;
                        $(".itinerary_div").append("<div id='" + itineraries_array[i].id + "'><h3><span id='span" + itineraries_array[i].id + "'>" + itineraries_array[i].info + "</span></h3>Itinerary Code: " + itineraries_array[i].confirmation_code + "<br><button class='add_tickets' id='add_" + itineraries_array[i].id + "'>Add more tickets</button><button class='view_tickets' id='view_" + itineraries_array[i].id + "'>View tickets in this itinerary</button>" + "</div>");
    
                    }
                }
                else {
                    alert("Sorry, you don't currently have any itineraries registered with that email");
                }
                

            },
            error: () => {
                alert("Sorry, you do not have any itineraries created with us rn");
            }


        });
    });

    $("body").on("click", "#create_itinerary", function() {
        if($("#create_itinerary_email").val() == "") {
            alert("please enter an email");
        }
        else {
            $.ajax(rootUrl + "itineraries",
            {
                type: "POST",
                dataType: "json",
                xhrFields: {withCredentials: true},
                data: {
                    "itinerary": {
                        "confirmation_code": make_confirmation_code(),
                        "email": $("#create_itinerary_email").val(),
                        "info": $("#itinerary_info").val(),
                    }
                },
                success: (response) => {
                    itinerary_id = response.id;
                    search_for_tickets();
                },
                error: () => {
                    alert("fuck itineraries");
                }
            });
        }
    });

    $("body").on("click", ".add_tickets", function() {
        let get_id = this.id;
        let spl = get_id.split("_");
        let this_itin_id = spl[1];
        itinerary_id = this_itin_id;
        search_for_tickets();
    });


    $("body").on("keyup", "#search_airline", function() {
        var str = $("#search_airline").val().toLowerCase();
        $(".airline").each(function() {
            var this_str = $(this).text().toLowerCase();
            var spl = this_str.split(":");
            var compare = spl[1];
            if(compare.includes(str)) {
                $(this).parent(".flight").show();
            }
            else {
                $(this).parent(".flight").hide();
            }
        });

    });

    $("body").on("click", ".view_tickets", function() {
        let this_id = this.id;
        let spl = this_id.split("_");
        let itin_id = spl[1];
        itinerary_id = itin_id;
        $.ajax(rootUrl + "itineraries/" + itinerary_id,
        {
            type: "GET",
            dataType: "json",
            xhrFields: {withCredentials: true},
            success: (response) => {
                itinerary_name = response.info;
            },
            error: () => {
                alert("could not get itinerary name :(");
            }
        });
        view_tickets_in_itinerary();
    });

    $("body").on("click", "#search_flights", function() {
        if($("#search_departure").val().toLowerCase() == "") {
            alert("Please select the city you are travelling from");
        }
        else if($("#search_arrival").val().toLowerCase() == "") {
            alert("Please select the city you are travelling to");
        }
        else {
            execute_ticket_search();
        }
    });

    $("body").on("click", "#buy1", function() {
        back_to_search_home();
    });

    $("body").on("click", ".delete_ticket", function() {
        let this_id = this.id;
        let str = this_id.split("_");
        let t_id = str[1];

        $.ajax(rootUrl + "tickets/" + t_id,
        {
            type: "DELETE",
            dataType: "json",
            xhrFields: {withCredentials: true},
            success: () => {
                let div_id = $("#date_" + t_id).text().toLowerCase();
                let div_spl = div_id.split(": ");
                let ticket_date = div_spl[1];
       //         if(validate_date(unfix_date_format(ticket_date))) {
                    alert("Succesfully cancelled ticket");
                    $("#ticket_" + t_id).css("border", "none");
                    $("#ticket_" + t_id).remove();
        //        }
        //        else {
        //            alert("Sorry, you can't cancel a ticket for a flight that's already happened");
         //       }
                
            },
            error: () => {
                alert("Sorry, we were unable to cancel your ticket");
            }
        });
    });

    $("body").on("click", ".ticket_info", function() {
        let button_id = this.id;
        if($(this).hasClass("clicked") != true) {
            let str = button_id.split("_");
            let flight_id = str[1];
            let flight_div_id = "f_" + flight_id;
            let purchase_info_id = "info_" + flight_id;
            let purchase_id = "purchase_" + flight_id;
            $("#" + flight_div_id).append("<div class='purchase_info' id='" + purchase_info_id + "'>Please put in the following information: </div>");
            let pdiv = $("#" + purchase_info_id);
            pdiv.append("<div>First name: <input class='fname' id='fname_" + flight_id + "'></div>");
            pdiv.append("<div>Middle name: <input class='mname' id='mname_" + flight_id + "'></div>");
            pdiv.append("<div>Last Name: <input class='lname' id='lname_" + flight_id + "'></div>");
            pdiv.append("<div>Age: <select class='age' id='age_" + flight_id + "'></select></div>");
            $("#age_" + flight_id).append("<option value='' disabled selected>Please Select</option>");
            put_ages_in_dropdown(flight_id);
            pdiv.append("<div>Gender: <select class='gender' id='gender_" + flight_id + "'></select></div>");
            $("#gender_" + flight_id).append("<option value='' disabled selected>Please Select</option>");
            $("#gender_" + flight_id).append("<option value='male'>Male</option>");
            $("#gender_" + flight_id).append("<option value='female'>Female</option>");
            $("#gender_" + flight_id).append("<option value='other'>Other</option>");
            pdiv.append("<div>Window Seat: <select id='window_" + flight_id + "'><option value='' disabled selected>Please Select</option><option value = 'true'>Yes</option><option value='false'>No</option></select></div>");
            pdiv.append("<div>Aisle Seat: <select id='aisle_" + flight_id + "'><option value='' disabled selected>Please Select</option><option value = 'true'>Yes</option><option value='false'>No</option></select></div>");
            pdiv.append("<div>Exit Seat: <select id='exit_" + flight_id + "'><option value='' disabled selected>Please Select</option><option value = 'true'>Yes</option><option value='false'>No</option></select></div>");
            pdiv.append("<div>Class (based on availability): <select class='cabin' id='cabin_" + flight_id + "'></select></div>");
            $("#cabin_" + flight_id).append("<option value='' disabled selected>Please Select</option>");
            $("#cabin_" + flight_id).append("<option value='First'>First Class</option>");
            $("#cabin_" + flight_id).append("<option value='Economy'>Economy</option>");
            $("#cabin_" + flight_id).append("<option value='Business'>Business</option>");
            pdiv.append("<div>Date: <select class='date' id='instance_" + flight_id + "'></select></div>");
            $("#instance_" + flight_id).append("<option value='' disabled selected>Please Select</option>");
            get_flight_dates(flight_id);
       //     pdiv.append("<div>Email: <input class='email' id='email_" + flight_id + "'></div>");
            pdiv.append("<button class='purchase' id='" + purchase_id + "'>Go!</button>");
      //      pdiv.append("<div>Gender: <input class='gender'></div>");
            $("#" + button_id).addClass("clicked");
        }
        
        else {
            alert("Can't get purchase info rip");
        }
        
    });

    $("body").on("click", ".purchase", function() {
        seat_found = false;
        let this_id = this.id;
        let str = this_id.split("_");
        let flight_id = str[1];
        let date = $("#instance_" + flight_id).val();
        if($("#fname_" + flight_id).val() == ""
            || $("#lname_" + flight_id).val() == ""
            || !$("#age_" + flight_id).val()
            || !$("#gender_" + flight_id).val()
            || !$("#window_" + flight_id).val()
            || !$("#aisle_" + flight_id).val()
            || !$("#exit_" + flight_id).val()
            || !$("#cabin_" + flight_id).val()
            || !$("#instance_" + flight_id).val() ) {
            alert("Please fill in all the requirments to purchase a ticket");
        }
        else {
            $.ajax(rootUrl + "instances?" + "filter[flight_id]=" + flight_id + "&filter[date]=" + date,
        {
            type: "GET",
            dataType: "json",
            xhrFields: {withCredentials: true},
            success: (response) => {
                if(response.length > 0) {
                    var instance_id = response[0].id;
                    var instance_info = response[0].info;
                $.ajax(rootUrl + "flights/" + flight_id,
                {
                    type: "GET",
                    dataType: "json",
                    xhrFields: {withCredentials: true},
                    success: (response) => {
                        let plane = response.plane_id;
                        let cabin = $("#cabin_" + flight_id).val();
                        let window = $("#window_" + flight_id).val();
                        let aisle = $("#aisle_" + flight_id).val();
                        let exit = $("#exit_" + flight_id).val();
                        $.ajax(rootUrl + "seats?" + "filter[plane_id]=" + plane + "&filter[cabin]=" + cabin + "&filter[is_window]=" + window + "&filter[is_aisle]=" + aisle + "&filter[is_exit]=" + exit,
                        {
                            type: "GET",
                            dataType: "json",
                            xhrFields: {withCredentials: true},
                            success: (response) => {
                                if(response.length > 0) {
                           //         console.log(response);
                                    buy_seat(response, instance_id, instance_info, flight_id);

                                    // didn't work lol
                                 /*   for(i=0; i<response.length;i++) {
                                        if(found_seat == false) {
                                            var seat_id = response[i].id;
                                            console.log(seat_id);
                                        $.ajax(rootUrl + "tickets?filter[instance_id]=" + instance_id + "&filter[seat_id]=" + seat_id,
                                        {   
                                            type: "GET",
                                            dataType: "json",
                                            xhrFields: {withCredentials: true},
                                            success: (response) => {
                                                if(response.length > 0) {
                                                    // do nothing
                                                }
                                                else {
                                                    seat_found = true;
                                                    //     var seat_id = response[0].id;
                                                    $.ajax(rootUrl + "tickets",
                                                    {
                                                        type: "POST",
                                                        dataType: "json",
                                                        xhrFields: {withCredentials: true},
                                                        data: {
                                                            "ticket": {
                                                                "first_name": $("#fname_" + flight_id).val(),
                                                                "middle_name": $("#mname_" + flight_id).val(),
                                                                "last_name": $("#lname_" + flight_id).val(),
                                                                "age": $("#age_" + flight_id).val(),
                                                                "gender": $("#gender_" + flight_id).val(),
                                                                "is_purchased": "true",
                                                                "price_paid": $("#thisPrice_" + flight_id).html(),
                                                                "instance_id": instance_id,
                                                                "itinerary_id": itinerary_id,
                                                                "seat_id": seat_id,
                                                            }
                                                    },
                                                    success: () => {
                                                        
                                                        view_tickets_in_itinerary();
                        
                                                    },
                                                    error: () => {
                                                        alert("error");
                                                    }
                                });
                                                }
                                            },
                                            error: () => {
                                                alert("Something went wrong");
                                            }
                                        });
                                        }
                                        else {
                                            return;
                                        }
                                        
                                    } */
                                    
                               
                                }
                                else {
                                    alert("Sorry, that seat is unavailable for that flight. Try changing your seat preferences.")
                                }
                                
                            },
                            error: () => {
                                alert("error");
                            }
            
                        });
                    },
                    error: () => {
                        alert("error");
                    }
                }); 
                }
                else {
                    alert("Sorry, no flights available for this date");
                }
                
                    },
                    error: () => {
                        alert("could not get instance");
                    }
            });
        }

        

    });

    $("body").on("click", ".home", function() {
        back_to_search_home();
    });


    
});

// Build_edit() function was my partner's work, everything else is my code.

function build_edit(){
    $("body").empty();
    var div1 = document.createElement("div");
               div1.setAttribute("id", 'editdiv');
    $("body").append(div1);
    
    var button1 = document.createElement('button');
                  button1.setAttribute("id", "buy1");
                  button1.innerHTML = "Buy Tickets";
    $("body").prepend(button1);
    
    $("#editdiv").append("<br>");
    $("#editdiv").append("<br>");
    $("#editdiv").append("<br>");
    $("#editdiv").append("<br>");
    
    var div = document.createElement("div");
    div.setAttribute("id", "ddiv");
    $("#editdiv").append(div);
    
    var t = document.createTextNode("What time is the flight departing?");
    $("#ddiv").append(t);
    
    var textfield = document.createElement("input");
    textfield.setAttribute("id", "dtime");
    textfield.setAttribute("type", "time");
    textfield.setAttribute("class", "formd");
    $("#ddiv").append(textfield);
    $("#ddiv").append("<br>");
    $("#ddiv").append("<br>");
    
    var button1 = document.createElement('button');
                  button1.setAttribute("id", "go1");
                  button1.setAttribute("class", "next");
                  button1.innerHTML = "Next";
    $("#ddiv").append(button1);
    
    $("#go1").click(function(){
        $("#ddiv").fadeOut(10);
        $("#adiv").fadeIn(1000);
       
    });
    
    var div = document.createElement("div");
    div.setAttribute("id", "adiv");
    $("#editdiv").append(div);
    //*****
    var t = document.createTextNode("What time will the flight Arrive?");
    $("#adiv").append(t);
    
    var textfield = document.createElement("input");
    textfield.setAttribute("id", "atime");
    textfield.setAttribute("type", "time");
    textfield.setAttribute("class", "formd");
    $("#adiv").append(textfield);
    
    $("#adiv").append("<br>");
    $("#adiv").append("<br>");
    
    var button1 = document.createElement('button');
                  button1.setAttribute("id", "go2");
                  button1.setAttribute("class", "next");
                  button1.innerHTML = "Next";
    $("#adiv").append(button1);
    
    $("#go2").click(function(){
        $("#adiv").fadeOut(10);
        $("#fldiv").fadeIn(1000);
       
    });
    
    var div = document.createElement("div");
    div.setAttribute("id", "fldiv");
    $("#editdiv").append(div);
    //*****
    var t = document.createTextNode("What is the flight number?");
    $("#fldiv").append(t);
    
    var textfield = document.createElement("input");
    textfield.setAttribute("id", "fnum");
    textfield.setAttribute("value", "123456");
    textfield.setAttribute("class", "formd");
    $("#fldiv").append(textfield);
    
    $("#fldiv").append("<br>");
    $("#fldiv").append("<br>");
    
    var button1 = document.createElement('button');
                  button1.setAttribute("id", "go3");
                  button1.setAttribute("class", "next");
                  button1.innerHTML = "Next";
    $("#fldiv").append(button1);
    
    $("#go3").click(function(){
        $("#fldiv").fadeOut(10);
        $("#planediv").fadeIn(1000);
       
    });

    var div = document.createElement("div");
    div.setAttribute("id", "planediv");
    $("#editdiv").append(div);
    //*****
    var t = document.createTextNode("What plane will this flight be on?");
    $("#planediv").append(t);
    
    /*var textfield = document.createElement("input");
    textfield.setAttribute("id", "idk");
    textfield.setAttribute("value", "this plane");
    textfield.setAttribute("class", "formd"); */
    $("#planediv").append("<select id='choose_plane'><option value='' disabled selected>Please Select</option></select>");

    $.ajax(rootUrl + "planes",
    {
        type: "GET",
        dataType: "json",
        xhrFields:{withCredentials: true},
        success: (response) => {
            for(i=0; i<response.length; i++) {
                $("#choose_plane").append("<option value='" + response[i].id + "'>" + response[i].name + "</option>");
            }
        },
        error: () => {
            alert("error, couldn't get planes");
        }
    });
    
    $("#planediv").append("<br>");
    $("#planediv").append("<br>");
    
    var button1 = document.createElement('button');
                  button1.setAttribute("id", "go8");
                  button1.setAttribute("class", "next");
                  button1.innerHTML = "Next";
    $("#planediv").append(button1);
    
    $("#go8").click(function(){
        $("#planediv").fadeOut(10);
        $("#dadiv").fadeIn(1000);
       
    });
    
    var div = document.createElement("div");
    div.setAttribute("id", "dadiv");
    $("#editdiv").append(div);
    //*****
    var t = document.createTextNode("Where is the flight departing from?");
    $("#dadiv").append(t);
    
    var textfield = document.createElement("input");
    textfield.setAttribute("id", "depid");
    textfield.setAttribute("value", "LGA");
    textfield.setAttribute("class", "formd");
    $("#dadiv").append(textfield);
    
    $("#dadiv").append("<br>");
    $("#dadiv").append("<br>");
    
    var button1 = document.createElement('button');
                  button1.setAttribute("id", "go4");
                  button1.setAttribute("class", "next");
                  button1.innerHTML = "Next";
    $("#dadiv").append(button1);
    
    $("#go4").click(function(){
        $("#dadiv").fadeOut(10);
        $("#ardiv").fadeIn(1000);
       
    });
    
    var div = document.createElement("div");
    div.setAttribute("id", "ardiv");
    $("#editdiv").append(div);
    //*****
    
    var t = document.createTextNode("Where is the flight arriving?");
    $("#ardiv").append(t);
    
    var textfield = document.createElement("input");
    textfield.setAttribute("id", "arrid");
    textfield.setAttribute("value", "BOS");
    textfield.setAttribute("class", "formd");
    $("#ardiv").append(textfield);
    
    $("#ardiv").append("<br>");
    $("#ardiv").append("<br>");
    
    var button1 = document.createElement('button');
                  button1.setAttribute("id", "go5");
                  button1.setAttribute("class", "next");
                  button1.innerHTML = "Next";
    $("#ardiv").append(button1);
    
    $("#go5").click(function(){
        $("#ardiv").fadeOut(10);
        $("#airdiv").fadeIn(1000);
       
    });
    
    var div = document.createElement("div");
    div.setAttribute("id", "airdiv");
    $("#editdiv").append(div);
    //*****
    
    var textfield = document.createElement("div");
    textfield.setAttribute("id", "txt");
    $("#airdiv").append(textfield);
    
    var t = document.createTextNode("What airline is flying?");
    $("#airdiv").append(t);
    
    var textfield = document.createElement("input");
    textfield.setAttribute("id", "airline");
    textfield.setAttribute("class", "formd");
    textfield.setAttribute("value", "Southwest Airlines");
    $("#airdiv").append(textfield);
    
    $("#airdiv").append("<br>");
    $("#airdiv").append("<br>");
    
    var button1 = document.createElement('button');
                  button1.setAttribute("id", "go6");
                  button1.setAttribute("class", "next");
                  button1.innerHTML = "Next";
    $("#airdiv").append(button1);
    
    $("#go6").click(function(){
        $("#airdiv").fadeOut(10);
        $(".ui-helper-hidden-accessible").fadeOut(10);
        $("#datdiv").fadeIn(1000);
       
    });
    
    var div = document.createElement("div");
    div.setAttribute("id", "datdiv");
    $("#editdiv").append(div);
    //*****
    
    var textfield = document.createElement("div");
    textfield.setAttribute("id", "txt");
    $("#datdiv").append(textfield);
    
    var t = document.createTextNode("What date is this flight?");
    $("#datdiv").append(t);
    
    var textfield = document.createElement("input");
    textfield.setAttribute("type", "date");
    textfield.setAttribute("id", "date");
    textfield.setAttribute("class", "formd");
    $("#datdiv").append(textfield);
    
    $("#datdiv").append("<br>");
    $("#datdiv").append("<br>");
    
    var button1 = document.createElement('button');
                  button1.setAttribute("id", "go7");
                  button1.setAttribute("class", "next");
                  button1.innerHTML = "Next";
    $("#datdiv").append(button1);
    
    $("#go7").click(function(){
        $("#datdiv").fadeOut(10);
        $("#subdiv").fadeIn(1000);
       
    });
    
    var div = document.createElement("div");
    div.setAttribute("id", "subdiv");
    $("#editdiv").append(div);
    //*****
    
    var button = document.createElement("input");
    button.setAttribute("id", "submit");
    button.setAttribute("type", "button");
    button.setAttribute("value", "Submit");
    button.setAttribute("class", "next");
    $("#subdiv").append(button);
    
    $("#subdiv").append("<br>");
    $("#subdiv").append("<br>");
    
    var button = document.createElement("input");
    button.setAttribute("id", "edit2");
    button.setAttribute("type", "button");
    button.setAttribute("value", "Create another Flight");
    button.setAttribute("class", "next");
    button.style.display == "none";
    $("#subdiv").append(button);
    $("#edit2").fadeOut(1);
    
    $(document).ready(function() {
        var airlineTags = [
            "Silver Airways (3M)",
            "Boutique Air (PRIV)",
            "Island Air (WP)",
            "WestJet",
            "Virgin Australia",
            "Virgin Atlantic Airways",
            "Virgin America",
            "US Airways",
            "United Airlines",
            "Turkish Airlines",
            "TAM Brazilian Airlines",
            "Spirit Airlines",
            "Southwest Airlines",
            "Singapore Airlines",
            "Sun Country Airlines",
            "Qatar Airways",
            "Qantas",
            "Pinnacle Airlines",
            "Lufthansa",
            "KLM Royal Dutch Airlines",
            "JetBlue Airways",
            "Japan Airlines",
            "Iberia Airlines",
            "Hawaiian Airlines",
            "Frontier Airlines",
            "Finnair",
            "Etihad Airways",
            "Delta Air Lines",
            "Copa Airlines",
            "China Airlines",
            "Cathay Pacific",
            "British Airways",
            "Airtran Airways",
            "Arkefly",
            "Aer Lingus",
            "Alitalia",
            "Alaska Airlines",
            "Air New Zealand",
            "Air Canada",
            "All Nippon Airways",
            "AeroMexico",
            "Air France",
            "Allegiant Air",
            "Asiana Airlines",
            "American Airlines",
        ];
        $("#airline").autocomplete({
            source: airlineTags,
            appendTo: "#txt",
        });
        
        
        
        $("#submit").unbind('click').click(function(){
            
            dept = $("#dtime").val().toString();
            arrt = $("#atime").val().toString();
            flNum = $("#fnum").val();
            flNum = parseInt(flNum);
            depi = $("#depid").val().toUpperCase();
            deptext = $("#depid").val().toUpperCase();
            planeId = $("#choose_plane").val();
            arri = $("#arrid").val().toUpperCase();
            arrtext =$("#arrid").val().toUpperCase();
            airid = $("#airline").val();
            airtext = $("#airline").val();
            flight;
            date = $("#date").val();
            
            //flight = create_flight(depid, arrid, dept, arrt, flNum, airid);
            $.ajax(rootUrl + "airports?" + "filter[code]=" + arri, {
                type: "GET",
                dataType: "json",
                xhrFields: { withCredentials: true },
                success: (response) => {
                    var a = response[0].id;
                    
                    $.ajax(rootUrl + "airports?" + "filter[code]=" + depi, {
                        type: "GET",
                        dataType: "json",
                        xhrFields: { withCredentials: true },
                        success: (response) => {
                            var b = response[0].id;
                            
                            $.ajax(rootUrl + "airlines?" + "filter[name]=" + airid, {
                                type: "GET",
                                dataType: "json",
                                xhrFields: { withCredentials: true },
                                success: (response) => {
                                    var c = response[0].id; 
                                    
                                    $.ajax(rootUrl + "flights", {
                                        type: "POST",
                                        dataType: "json",
                                        xhrFields: { withCredentials: true },
                                        data: {
                                            "flight": {
                                                "departs_at": dept,
                                                "arrives_at": arrt,
                                                "number": flNum,
                                                "plane_id": planeId,
                                                "departure_id": b,
                                                "arrival_id": a,
                                                "next_flight_id": undefined,
                                                "airline_id": c,
                                                "info": undefined,
                                            },
                                        },
                                        success: () => {
                                             $.ajax(rootUrl + "flights?" + "filter[departure_id]=" + b + "&filter[arrival_id]=" + a + "&filter[departs_at]=" + dept + "&filter[arrives_at]=" + arrt + "&filter[number]=" + flNum + "&filter[airline_id]=" + c, {
                                                type: "GET",
                                                dataType: "json",
                                                xhrFields: { withCredentials: true },
                                                success: (response) => {
                                                    var d = response[0].id;
                                                    
                                                    $.ajax(rootUrl + "instances", {
                                                        type: "POST",
                                                        dataType: "json",
                                                        xhrFields: { withCredentials: true },
                                                        data: {
                                                            "instance":{
                                                                "flight_id": d,
                                                                "date": date,
                                                            },
                                                        },
                                                        success: () => {
                                                            $("#submit").attr("display", "hidden");
                                                            var t = document.createTextNode("New Flight Created, departing at " + dept +
                                                                                            " from " + deptext+ " and arriving at " + arrtext + " at " + arrt + " with " + airtext + " on " + date);
                                                            $("#subdiv").prepend(t);
                                                            $("#submit").fadeOut(500);
                                                            $("#edit2").fadeIn(1000);
                                                            
                                                        },
                                                        error: () => {
                                                            console.log("fail instance");
                                                        }
                                                    });
                                
                                                },
                                                error: () => {
                                                    console.log("fail search");
                                                }
                                            });
                                        },
                                        error: () => {
                                            console.log("fail flight");
                                        }
                                    });
                                    
                                },
                                error: () => {
                                    console.log("fail airline");
                                }
                            });
                            
                        },
                        error: () => {
                            console.log("fail departure code");
                        }
                    });
                                
                },
                error: () => {
                    console.log("fail arrival code");
                }
            });
            
            
        });
    });
                      
}
// end build function; JingJing's code starts again

// credit to this function is from stackoverflow
function make_confirmation_code() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  
    for (var i = 0; i < 7; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
  }

// credit this function to w3resource.com
function capital_letter(str) {
    str = str.toLowerCase();
    str = str.split(" ");

    for (var i = 0, x = str.length; i < x; i++) {
        str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    }
    return str.join(" ");
}

function buy_seat(seat_array, instance_id, instance_info, flight_id) {
    let date = $("#instance_" + flight_id).val();
 //   console.log(instance_info);
    for(i=0; i<seat_array.length; i++) {
        let seat_id = seat_array[i].id;
        if(instance_info != null && instance_info.includes(seat_id + ",")) {
            if(i == seat_array.length - 1) {
                alert("Sorry, there are no more of your preferred seats on this flight");
            }
        }
        else {
            $.ajax(rootUrl + "tickets",
            {
                type: "POST",
                dataType: "json",
                xhrFields: {withCredentials: true},
                data: {
                    "ticket": {
                        "first_name": $("#fname_" + flight_id).val(),
                        "middle_name": $("#mname_" + flight_id).val(),
                        "last_name": $("#lname_" + flight_id).val(),
                        "age": $("#age_" + flight_id).val(),
                        "gender": $("#gender_" + flight_id).val(),
                        "is_purchased": "true",
                        "price_paid": $("#thisPrice_" + flight_id).html(),
                        "instance_id": instance_id,
                        "itinerary_id": itinerary_id,
                        "seat_id": seat_id,
                    }
                },
                    success: () => {
                        $.ajax(rootUrl + "instances/" + instance_id,
                        {
                            type: "PUT",
                            dataType: "json",
                            xhrFields: {withCredentials: true},
                            data: {
                                "instance": {
                                    "flight_id": flight_id,
                                    "date": date,
                                    "is_cancelled": "false",
                                    "info": instance_info + seat_id + ", "

                                }
                            },
                            success: () => {
                                // yay
                            },
                            error: () => {
                                alert("boo");
                            }
                            
                        });           
                        back_to_search_home();
                        
                    },
                    error: () => {
                        alert("fuck");
                    }
                    });
            break;
        }
    }
 /*   $.ajax(rootUrl + "instances/" + instance_id,
    {
        type: "GET",
        dataType: "json",
        xhrFields: {withCredentials: true},
        success: (response) => {

        },
        error: () => {
            alert("who needs seats?");
        }
    }); */
    
}

function fix_date_format(date) {
    var fix = date.split("-");
    var month = fix[1];
    var day = fix[2];
    var year = fix[0];
    
    var fixed_date = month + "/" + day + "/" + year;
    return fixed_date;
}

function unfix_date_format(date) {
    var unfix = date.split("/");
    var year = unfix[2];
    var month = unfix[0];
    var day = unfix[1];

    var unfixed_date = year + "-" + month + "-" + date;
    return unfixed_date;
}

// credit for this function goes to stackoverflow
function get_date() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    } 
    if (mm < 10) {
        mm = '0' + mm;
    } 
    var today = yyyy + '/' + mm + '/' + dd;

  //  console.log(today);
    return today;

}

function put_ages_in_dropdown(flight_id) {
    for(i=18;i<101;i++) {
        $("#age_" + flight_id).append("<option value='" + i +"'>" + i + "</option>");
    }
}

function view_tickets_in_itinerary() {
    $.ajax(rootUrl + "tickets?" + "filter[itinerary_id]=" + itinerary_id,
    {
        type: "GET",
        dataType: "json",
        xhrFields: {withCredentials: true},
        success: (response) => {
            if(response.length > 0) {
                $("body").empty();
                $("body").append("<span class='button_header'></span>");
                $(".button_header").append("<button id='edit3'>Edit Flights</button><br><button class='home'>Go Back</button>");
                $("body").append("<h1 class='tix_title'>Tickets for " + itinerary_name + "</h1>");
                $("body").append("<div class='tix'></div>");
            //    $("body").append("<h1>Tickets for " + itinerary_name);
          //      $("body").append("<button class='home'>Home</button>");
                tickets_div(response);
            }
            else {
                alert("Sorry, there are no tickets in your inventory right now");
            }
        },
        error: () => {
            alert("Sorry, couldn't get the tickets in your itinerary");
        }
    });
}

function randomNumber(max, min) {
    return Math.floor((Math.random() * max) + min);
}

function execute_ticket_search() {
    $(".flights").empty();
    let search_depart_city = capital_letter($("#search_departure").val().toLowerCase());
 //   let search_depart_city = $("#search_departure").val().toLowerCase();
    let search_arrive_city = capital_letter($("#search_arrival").val().toLowerCase());
 //   let arrive_city;
 //   let depart_city;

        $.ajax(rootUrl + "airports?" + "filter[city]=" + search_depart_city,
        {
            type: "GET",
            dataType: "json",
            xhrFields: {withCredentials: true},
            success: (response) => {
                let air_array = response;
                if(air_array.length >0) {
                    var depart_airport = response[0].id;
                    if(air_array.length == 2) {
                        var depart_airport_2 = response[1].id;
                    }
                
                
                $.ajax(rootUrl + "airports?" + "filter[city]=" + search_arrive_city,
                {
                    type: "GET",
                    dataType: "json",
                    xhrFields: {withCredentials: true},
                    success: (response) => {
                        if(response.length >0) {
                            for(i=0; i<response.length; i++) {
                                var arrive_airport = response[i].id;
                                get_flights_by_airport_ids(depart_airport, arrive_airport);
                      //          get_flights_by_airport_ids(depart_airport_2, arrive_airport);
                            }
                            
                        }
                        else {
                            // do nothing
                        }
                        

                    },
                    error: () => {
                        alert("didn't work rip");
                    }
                });
                }
                else{
                    alert("Oops, check your spelling");
                }
                
            },
            error:() => {
                alert("oops");
            }
        });
    
}

function get_flights_by_airport_ids(depart_airport_id, arrive_airport_id) {
  //  console.log(depart_airport_id);
  //  console.log(arrive_airport_id);
    $.ajax(rootUrl + "flights?" + "filter[departure_id]=" + depart_airport_id + "&filter[arrival_id]=" + arrive_airport_id,
    {
        type: "GET",
        dataType: "json",
        xhrFields: {withCredentials: true},
        success: (response) => {
            $(".search_by_airline").remove();
            $(".weather").remove();
            $(".sorry").remove();
     //       console.log(response);
            let flight_array=response;
            $(".header").append("<div class='search_by_airline'>Search by airline: <input id='search_airline'></div>");
            $(".header").append("<div class='weather'><b>Current Temperature in " + capital_letter($("#search_arrival").val()) + "</b>: </div>");
            get_weather($("#search_arrival").val().toLowerCase());
            if(flight_array.length > 0) {
                for(i=0; i< flight_array.length; i++) {
                    flight_div(flight_array[i]);
                }
            }
            else if(response.length == 0) {
                $(".sorry").remove();
                $(".weather").remove();
                $("body").append("<div class='sorry'>Sorry, there were no flights that matched your search</div>");
            }
           
        },
        error: () => {
            alert("you suck at filtering");
        }
    });
}

function back_to_search_home() {
    let body = $("body");
    body.empty();
    body.append("<button id='edit3'>Edit Flights</button>");
    body.append("<div class='find_itinerary'></div>");
    let idiv = $(".find_itinerary");
    idiv.append("<h1>Look up or create an itinerary!</h1>");
    idiv.append("<div><b>Enter your email if you already have an itinerary:</b> <input id='itinerary_email' value='" + itin_email + "'><button id='get_itinerary'>Go!</button></div>");
    idiv.append("<div><b>Enter an email and a name for your itinerary to create a new one:</b><br><br>Email: <input id='create_itinerary_email'><br>Itinerary Name: <input id='itinerary_info'><button id='create_itinerary'>Go!</button>");
}

function tickets_div(tickets) {
  //  $("body").append("<div class='tix'></div>");
    for(i=0; i<tickets.length; i++) {  
        let t_div = $(".tix");
        let inst_id = tickets[i].instance_id;
        let t_id = tickets[i].id;
        t_div.append("<div class='this_ticket' id='ticket_" + t_id + "'></div>");
        let this_ticket_info = $("#ticket_" + t_id);
        this_ticket_info.append("<div><b>Name on ticket</b>: " + tickets[i].first_name + " " + tickets[i].middle_name + " " + tickets[i].last_name + "</div>");
        this_ticket_info.append("<div id='cabin_" + t_id + "'></div>"); // cabin
        this_ticket_info.append("<div id='seat_" + t_id +"'></div>"); // seat number
        this_ticket_info.append("<div id='price_" + t_id + "'><b>Price Paid</b>: $" + tickets[i].price_paid + "</div>"); //ticket price
        this_ticket_info.append("<div id='date_" + t_id + "'></div>"); // flight date
        this_ticket_info.append("<div id='departTime_" + t_id + "'></div>"); //departtime
        this_ticket_info.append("<div id='arriveTime_" + t_id + "'></div>"); //arrival time
        this_ticket_info.append("<div id='flightNum_" + t_id + "'></div>"); // flight num
        this_ticket_info.append("<div id='airline_" + t_id + "'></div>"); // airline
        this_ticket_info.append("<div id='departAirport_" + t_id + "'></div>"); // depart airport
        this_ticket_info.append("<div id='arriveAirport_" + t_id + "'></div>"); //arrival airport
        
        this_ticket_info.append("<button class='delete_ticket' id='button_" + t_id + "'>Cancel Ticket</button>");
        
        $.ajax(rootUrl + "seats/" + tickets[i].seat_id,
        {
            type: "GET",
            dataType: "json",
            xhrFields: {withCredentials: true},
            success: (response) => {
                $("#cabin_" + t_id).append("<b>Cabin</b>: " + response.cabin);
                $("#seat_" + t_id).append("<b>Seat Number</b>: " + response.row + " " + response.number);
                $.ajax(rootUrl + "instances/" + inst_id,
                {
                    type: "GET",
                    dataType: "json",
                    xhrFields: {withCredentials: true},
                    success: (response) => {
                        $("#date_" + t_id).append("<b>Flight Date: </b>" + fix_date_format(response.date));
                        let flight_id = response.flight_id;
                        $.ajax(rootUrl + "flights/" + flight_id,
                        {
                            type: "GET",
                            dataType: "json",
                            xhrFields: {withCredentials: true},
                            success: (response) => {
                                $("#departTime_" + t_id).append("<b>Departure Time</b>: " + get_time_by_id(response.departs_at));
                                $("#arriveTime_" + t_id).append("<b>Arrival Time</b>: " + get_time_by_id(response.arrives_at));
                                $("#flightNum_" + t_id).append("<b>Flight Number</b>: " + response.number);
                                get_ticket_airline_by_id(response.airline_id, t_id);
                                get_airports_for_tickets(response.departure_id, t_id, "depart");
                                get_airports_for_tickets(response.arrival_id, t_id, "arrive");

                            },
                            error: () => {
                                alert("oops, sorry, something went wrong");
                            }
                        });
                    },
                    error: () => {
                        alert("didn't work");
                    }
                });
            },
            error: () => {
                alert("Sorry, could not get your ticket information");
            }
        });
    }

} 

// credit to codexworld
function validate_date(date) {
    date = new Date(date);
    var today = new Date(todays_date);

    if(date > today){
    //    console.log(date);
        return true;
    }
    else{
       return false;
}
}

function get_flight_dates(flight_id) {
    let dropdown = $("#instance_" + flight_id);

    $.ajax(rootUrl + "instances?filter[flight_id]=" + flight_id,
    {
        type: "GET",
        dataType: "json",
        xhrFields: {withCredentials: true},
        success: (response) => {
            
            for(i=0; i<response.length; i++) {
                if(validate_date(response[i].date)) {
                    dropdown.append("<option value='" + response[i].date + "'>" + fix_date_format(response[i].date) + "</option>");
                }
                else {
                    // do nothing
                }
                
            }
        },
        error: () => {
            alert("didn't work");
        }
    });
}

function search_for_tickets() {
    let body = $("body");
    body.empty();
    body.append("<span class='button_header'></span>");
    $(".button_header").append("<button id='edit3'>Edit Flights</button><br><button class='home'>Go Back</button>");
    body.append("<div class='header'></div>");
    let head = $(".header");
    head.append("<h1>Search for flights! :)</h1>");
    head.append("Enter the city you are travelling from: <input value='' id='search_departure'><br>");
    head.append("Enter the city you are travelling to: <input value='' id='search_arrival'><br>");
    head.append("<button id='search_flights'>Search!</button>");
    head.after("<div class='flights'></div>");
}


function flight_div(flight) {
    $.ajax(rootUrl + "instances?filter[flight_id]=" + flight.id,
    {
        type: "GET",
        dataType: "json",
        xhrFields: {withCredentials: true},
        success: (response) => {
            if(response.length > 0) {
                $(".sorry").remove();
                let flight_id = flight.id;
                let depart_time = flight.departs_at;
                let arrive_time = flight.arrives_at;
                let flight_num = flight.number;
                let airline = flight.airline_id;
                let div_id = "f_" + flight_id;
                let airline_div_id = "airline_" + flight_id;
                let departure_div_id = "depart_" + flight_id;
                let arrival_div_id = "arrive_" + flight_id;
                let button_id = "button_" + flight_id;
                let price_id = "price_" + flight_id;


                $(".flights").append("<br><div class='flight' id='" + div_id + "'></div>");
                let fdiv = $("#" + div_id);
        //   fdiv.append("<div><b>Flight ID</b>: " + flight_id + "</div>");
                fdiv.append("<div><b>Departure Time</b>: " + get_time_by_id(depart_time) + "</div>");
                fdiv.append("<div><b>Arrival Time</b>: " + get_time_by_id(arrive_time) + "</div>");
                fdiv.append("<div><b>Flight Number</b>: " + flight_num + "</div>");
                fdiv.append("<div class='airline' id='" + airline_div_id + "'><b>Airline</b>: </div>");
                fdiv.append("<div class='depart' id='" + departure_div_id + "'><b>Depart from</b>: </div>");
                fdiv.append("<div class='arrive' id='" + arrival_div_id + "'><b>Arrive at</b>: </div>");
                fdiv.append("<div class='price' id='" + price_id + "'><b>Ticket Price</b>: " + "$<span id='thisPrice_" + flight_id + "'>" + randomNumber(250, 60) + "</span></div>");
                fdiv.append("<button class='ticket_info' id='" + button_id + "'>Buy ticket</button>");
                get_airline_by_id(airline, flight_id);
                get_airport_by_id(flight.departure_id, flight_id, "depart");
                get_airport_by_id(flight.arrival_id, flight_id, "arrive");
            }
            else {
                // do nothing
            }
            
        },
        error: () => {
            // do nothing
        }
    });
    
    

}

function get_weather(city) {
    $.ajax(
    {
        url: "http://api.openweathermap.org/data/2.5/weather?q=" + city + ",us&units=imperial&APPID=55b1ce2c4f63f6f04063dc910ef1207b",
        type: "GET",
        dataType: "json",
        success: (response) => {
            $(".weather").empty();
            $(".weather").append("<b>Current Temperature in " + capital_letter($("#search_arrival").val()) + "</b>: ");
            $(".weather").append(response.main.temp + "&#176; F");
        },
        error: () => {
            alert("sad");
        }
    });
}

function get_ticket_airline_by_id(airline_id, ticket_id) {
    $.ajax(rootUrl + "airlines/" + airline_id,
    {
        type: "GET",
        dataType: "json",
        xhrFields: {withCredentials: true },
        success: (response) => {
            $("#airline_" + ticket_id).append("<b>Airline</b>: " + response.name);
        },
        error: () => {
            alert("error");
        }
    });
}

function get_airline_by_id(airline_id, flight_id) {
    $.ajax(rootUrl + "airlines/" + airline_id,
    {
        type: "GET",
        dataType: "json",
        xhrFields: {withCredentials: true },
        success: (response) => {
            var airline_name = response.name;
            let airline_div_id = "airline_" + flight_id;
            $("#" + airline_div_id).append(airline_name);
        
        },
        error: () => {
            alert("didn't work");
        }
    });
    
}

function get_airports_for_tickets(airport_id, ticket_id, x) {
    $.ajax(rootUrl + "airports/" + airport_id,
    {
        type: "GET",
        dataType: "json",
        xhrFields: { withCredentials: true },
        success: (response) => {
            if(x == "depart") {
                $("#departAirport_" + ticket_id).append("<b>Depart from</b>: " + response.name + " (" + response.code + ")");
            }
            else if(x == "arrive") {
                $("#arriveAirport_" + ticket_id).append("<b>Arrive at</b>: " + response.name + " (" + response.code + ")");
            }
            
            
        },
        error: () => {
            alert("error");
        }
    });
}

function get_airport_by_id(airport_id, flight_id, x) {
    $.ajax(rootUrl + "airports/" + airport_id,
    {
        type: "GET",
        dataType: "json",
        xhrFields: { withCredentials: true },
        success: (response) => {
            if(x == "depart") {
                let departure_div_id = "depart_" + flight_id;
                $("#" + departure_div_id).append(response.name + " (" + response.code + ")");
            }
            else if(x == "arrive") {
                let arrival_div_id = "arrive_" + flight_id;
                $("#" + arrival_div_id).append(response.name + " (" + response.code + ")");
            }
            
            
        },
        error: () => {
            alert("error");
        }
    });
}

function get_time_by_id(time) {
    var str = time.split("T");
    var spl = str[1].split(".");
    var again = spl[0].split(":");
    return again[0] + ":" + again[1];
}


function build(){
    $("body").empty();
    var button1 = document.createElement('button');
                  button1.setAttribute("id", "buy");
                  button1.innerHTML = "Buy Tickets";
    $("body").append(button1);
    var button2 = document.createElement('button');
                  button2.setAttribute("id", "edit"); 
                  button2.innerHTML = "Edit Flights";
    $("body").append(button2);
    
    $("body").on("click", "#edit", function() {
        build_edit();
    });
    
}
