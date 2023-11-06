import React, { useState, useRef, useEffect } from 'react';
import './styles/styles.scss'

import { Container, Tabs, Tab } from 'react-bootstrap';
import Settings from './components/Settings';
import Posts from './components/Posts';
import { useDispatch, useSelector } from 'react-redux';
import Navigation from './components/Navigation';
import Toasts from './components/Toasts';


export default function App(props) {
  const dispatch = useDispatch()


  const sections = ozplugin_vars.settings.pages;
  const Key = useSelector(state => state.app.activeTab) || Object.keys(sections)[0];

  const setKey = (payload) => {
    dispatch({
      type: 'ACTIVE_TAB',
      payload
    })
  }

  useEffect(() => {
    dispatch({
      type: 'SET_SETTINGS',
      payload: ozplugin_vars.settings
    })
  }, [])

  useEffect(() => {
    let switches = []

    Object.entries(ozplugin_vars.settings.pages).map(op => {
      if (!op[1]?.tabs) return;
      op[1].tabs.map(tab => {
        let options = tab.options.filter(option => option.fields?.length == 1 && option.fields[0].type == 'switch' && option.fields[0].value)
          .map(option => {
            let name = option.fields[0].name
            if (option.fields[0]?.values && option.fields[0]?.values.length && typeof option.fields[0].values[0].value == 'string') {
              name = name + '-' + option.fields[0].values[0].value
            }
            return name
          })
        if (options.length)
          switches = [...switches, ...options]
      })
    })
    dispatch({
      type: 'SET_SWITCHES',
      payload: switches
    })
  }, [])

  useEffect(() => {
    var event = new CustomEvent('onOzSettingsRendered', {});
    document.addEventListener('onOzSettingsRendered', function () { }, false);
    document.dispatchEvent(event);
  }, [])

  return (
    <div className="oz_admin_settings-fixed pb-4">
      <div className="oz_admin_settings">
        <div className="oz_admin_settings-wrap">
          <Navigation />
          <Container>
            <h3 className="my-4">{sections[Key].name}</h3>
            <Tabs
              id="oz_tabs"
              activeKey={Key}
              onSelect={(k) => setKey(k)}
              className="mb-3"
            >
              {Object.entries(sections).map(section => {
                let tpl = ozplugin_lang.wrongpagetype
                if (typeof section[1].view != 'undefined') {
                  switch (section[1]?.view.type) {
                    case 'settings':
                      tpl = <Settings settings={section[1].tabs} />
                      break;
                    case 'posts':
                      tpl = <Posts settings={{ ...section[1], id: section[0] }} />
                      break;
                    case 'users':
                      tpl = <Posts settings={{ ...section[1], id: section[0] }} />
                      break;
                  }
                }
                return (
                  <Tab tabClassName='oz_tab-underline' eventKey={section[0]} title={section[1].name}>
                    {tpl}
                  </Tab>
                )
              })}
            </Tabs>
          </Container>
          <Toasts />
        </div>
      </div>
    </div>
  )
}