// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

chrome.alarms.onAlarm.addListener(function () {
  chrome.storage.sync.get(['zip'], function (item) {
    console.log(item.zip);
    fetchTiming(item.zip);
  });
});
chrome.notifications.onClicked.addListener(function () {
  chrome.tabs.create({ url: "https://www.fairprice.com.sg/cart" })
});
chrome.notifications.onButtonClicked.addListener(function () {
  chrome.storage.sync.get(['minutes'], function (item) {
    chrome.browserAction.setBadgeText({ text: 'ON' });
    chrome.alarms.create({ delayInMinutes: item.minutes });
  });
});
const ntucData = {
  base: 'https://website-api.omni.fairprice.com.sg/api',
  storeId: 165,
}
function fetchJson(url) {
  return fetch(url)
    .then(res => res.json());
}
function constructData(zip) {
  let data = {
    address: {
      pincode: `${zip}`,
    },
    storeId: `${ntucData.storeId}`,
    orderType: "DELIVERY",
    cart: {
      items: [],
    },
  };
  return {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    //mode: 'no-cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    //redirect: 'follow', // manual, *follow, error
    //referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  }
}
function fetchSlots(zip) {
  let options = constructData(zip);
  fetch(`${ntucData.base}/checkout`, options)
    .then(res => res.json())
    .then(result => {
      console.log(JSON.stringify(result));
      let answer = iterateProps(result.data.slot)
      if(answer.available){
        console.log(answer.slot)
      }else{
        console.log('no slot');
      }
    }).catch(error => {
      createNotificationV2(false);
    });
}

function iterateProps(result) {
  Object.keys(result).forEach(function (prop, index) {
    // prop: the name of the object property
    // index: the ordinal position of the property within the object 
    console.log(prop, index);
    console.log(result[prop]);
    result[prop].forEach(element => {
      console.log(element);
      if (element.available) {
        return { available: true, slot: element};
      }
    })
  });
  return {available : false, slot: ''};
}
function fetchTiming(zip) {
  fetch(`https://website-api.omni.fairprice.com.sg/api/slot-availability?address[pincode]=${zip}&storeId=165`)
    .then(res => res.json())
    .then(res => {
      createNotificationV2(res.data.available);
    });
};
function createNotificationV2(response) {
  console.log(response);
  if (response) {
    //create notification
    notify();
  } else {
    //set interval
    setAlarm();
  }
};
function notify() {
  chrome.browserAction.setBadgeText({ text: '' });
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons8-box-64.png',
    title: 'Available',
    message: 'Slots are available!\n Click to go to cart',
    buttons: [
      { title: 'Keep checking.' }
    ],
    priority: 0
  });
};

function setAlarm() {
  chrome.storage.sync.get(['minutes'], function (item) {
    chrome.browserAction.setBadgeText({ text: 'ON' });
    chrome.alarms.create({ delayInMinutes: item.minutes });
  });
}