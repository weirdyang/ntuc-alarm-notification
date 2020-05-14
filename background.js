// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

chrome.alarms.onAlarm.addListener(function() {
  chrome.storage.sync.get(['zip'], function(item) {
    console.log(item.zip);
    fetchTiming(item.zip);
  });
});
chrome.notifications.onClicked.addListener(function(){
  chrome.tabs.create({url: "https://www.fairprice.com.sg/cart"})
});
chrome.notifications.onButtonClicked.addListener(function() {
  chrome.storage.sync.get(['minutes'], function(item) {
    chrome.browserAction.setBadgeText({text: 'ON'});
    chrome.alarms.create({delayInMinutes: item.minutes});
  });
});

function fetchTiming(zip){
      fetch(`https://website-api.omni.fairprice.com.sg/api/slot-availability?address[pincode]=${zip}&storeId=165`, {cache: "no-store"})
      .then(res => res.json())
      .then(res => {
      createNotificationV2(res.data.available);
    });
  };
function createNotificationV2(response){
  console.log(response);
  if(response){
    //create notification
    notify();
  } else {
    //set interval
    setAlarm();
  }
};
function notify(){
  chrome.browserAction.setBadgeText({text: ''});
  chrome.notifications.create({
      type:     'basic',
      iconUrl:  'icons8-box-64.png',
      title:    'Available',
      message:  'Slots are available!\n Click to go to cart',
      buttons: [
        {title: 'Keep checking.'}
      ],
      priority: 0});
};

function setAlarm(){
  chrome.storage.sync.get(['minutes'], function(item) {
    chrome.browserAction.setBadgeText({text: 'ON'});
    chrome.alarms.create({delayInMinutes: item.minutes});
  });
}
