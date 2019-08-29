(function () {
    'use strict';

    var app = {
        isLoading: true,
        visibleCards: {},
        selectedTimetables: [],
        spinner: document.querySelector('.loader'),
        cardTemplate: document.querySelector('.cardTemplate'),
        container: document.querySelector('.main'),
        addDialog: document.querySelector('.dialog-container')
    };
    loadSelectedTimetables();



    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/

    document.getElementById('butRefresh').addEventListener('click', function () {
        // Refresh all of the metro stations
        app.updateSchedules();
    });

    document.getElementById('butAdd').addEventListener('click', function () {
        // Open/show the add new station dialog
        app.toggleAddDialog(true);
    });

    document.getElementById('butAddCity').addEventListener('click', function () {

        var select = document.getElementById('selectTimetableToAdd');
        var selected = select.options[select.selectedIndex];
        var key = selected.value;
        var label = selected.textContent;
        if (!app.selectedTimetables) {
            app.selectedTimetables = [];
        }
        app.getSchedule(key, label);
        app.selectedTimetables.push({key: key, label: label});
        app.toggleAddDialog(false);
        saveSelectedTimetables(app.selectedTimetables);

    });

    document.getElementById('butAddCancel').addEventListener('click', function () {
        // Close the add new station dialog
        app.toggleAddDialog(false);
    });


    /*****************************************************************************
     *
     * Methods to update/refresh the UI
     *
     ****************************************************************************/

    // Toggles the visibility of the add new station dialog.
    app.toggleAddDialog = function (visible) {
        if (visible) {
            app.addDialog.classList.add('dialog-container--visible');
        } else {
            app.addDialog.classList.remove('dialog-container--visible');
        }
    };

    // Updates a timestation card with the latest weather forecast. If the card
    // doesn't already exist, it's cloned from the template.

    function saveSelectedTimetables(selectedTimetables) {
        const selectedTimetablesLocal = JSON.stringify(selectedTimetables);
        if(selectedTimetablesLocal) {
            sessionStorage.setItem('selectedTimetables', selectedTimetablesLocal);
        }
    }

    function loadSelectedTimetables() {
        let selectedTimetables = sessionStorage.getItem('selectedTimetables');
        app.selectedTimetables = JSON.parse(selectedTimetables);
    }

    app.updateTimetableCard = function (data) {
        var key = data.key;
        var dataLastUpdated = new Date(data.created);
        var schedules = data.schedules;
        var card = app.visibleCards[key];

        if (!card) {
            var label = data.label.split(', ');
            var title = label[0];
            var subtitle = label[1];
            card = app.cardTemplate.cloneNode(true);
            card.classList.remove('cardTemplate');
            card.querySelector('.label').textContent = title;
            card.querySelector('.subtitle').textContent = subtitle;
            card.removeAttribute('hidden');
            app.container.appendChild(card);
            app.visibleCards[key] = card;
        }

        if ( card.querySelector('.card-last-updated').textContent >= dataLastUpdated) {
            console.log("no se actualiza");
            return;
        }
        console.log("Si se actualiza");
        card.querySelector('.card-last-updated').textContent = data.created;

        var scheduleUIs = card.querySelectorAll('.schedule');
        for(var i = 0; i<4; i++) {
            var schedule = schedules[i];
            var scheduleUI = scheduleUIs[i];
            if(schedule && scheduleUI) {
                scheduleUI.querySelector('.message').textContent = schedule.message;
            }
        }

        if (app.isLoading) {
            window.cardLoadTime = performance.now();
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
        }
    };

    /*****************************************************************************
     *
     * Methods for dealing with the model
     *
     ****************************************************************************/

    function getScheduleFromCache(key){
        if (!('caches' in window)) {
            return null;
        }
        var url = 'https://api-ratp.pierre-grimaud.fr/v3/schedules/' + key;
        console.log("Cache url:" + url);
        return caches.match(url)
            .then((response) => {
                if (response) {
                    return response.json();
                }
                return null;
            })
            .catch((err) => {
                console.error('Error getting data from cache', err);
                return null;
            });
    }

    function getScheduleFromNetwork(key){
        var url = 'https://api-ratp.pierre-grimaud.fr/v3/schedules/' + key;
        console.log("Network url:" + url);
        return fetch(url,{method: 'GET'})
          .then((response) => {
                return response.json();
          })
          .catch(() => {
            return null;
          });
    }

    app.getSchedule = function (key, label) {

        console.log("getSchedule:" + key);
        getScheduleFromCache(key).then((responseJson) => {
            var result = {};
            result.key = key;
            result.label = label;
            result.created = responseJson._metadata.date;
            result.schedules = responseJson.result.schedules;
            app.updateTimetableCard(result);
        }).catch(() => {
            // app.updateTimetableCard(initialStationTimetable);
        });
        getScheduleFromNetwork(key).then((responseJson) => {
            var result = {};
            result.key = key;
            result.label = label;
            result.created = responseJson._metadata.date;
            result.schedules = responseJson.result.schedules;
            console.log("network:" + result.key);
            app.updateTimetableCard(result);
        }).catch(() => {
            // app.updateTimetableCard(initialStationTimetable);
        });
    };



    // Iterate all of the cards and attempt to get the latest timetable data
    app.updateSchedules = function () {
        var keys = Object.keys(app.visibleCards);
        keys.forEach(function (key) {
            app.getSchedule(key);
        });
    };

    /*
     * Fake timetable data that is presented when the user first uses the app,
     * or when the user has not saved any stations. See startup code for more
     * discussion.
     */

    var initialStationTimetable = {

        key: 'metros/1/bastille/A',
        label: 'Bastille, Direction La Défense',
        created: '2017-07-18T17:08:42+02:00',
        schedules: [
            {
                message: '0 mn'
            },
            {
                message: '2 mn'
            },
            {
                message: '5 mn'
            }
        ]


    };


    /************************************************************************
     *
     * Code required to start the app
     *
     * NOTE: To simplify this codelab, we've used localStorage.
     *   localStorage is a synchronous API and has serious performance
     *   implications. It should not be used in production applications!
     *   Instead, check out IDB (https://www.npmjs.com/package/idb) or
     *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
     ************************************************************************/

    loadSelectedTimetables();
    if(app.selectedTimetables){
        app.selectedTimetables.forEach(function (response) {
            app.getSchedule(response.key, response.label);
            
        })

    }else {
        app.getSchedule('metros/1/bastille/A', 'Bastille, Direction La Défense');
        app.selectedTimetables = [
        {key: initialStationTimetable.key, label: initialStationTimetable.label}
        ];
        saveSelectedTimetables(app.selectedTimetables);
    }

    // CODELAB: Register service worker.
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((reg) => {
              console.log('Service worker registered.', reg);
            });
      });
    }
})();
