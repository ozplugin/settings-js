import React, { useState, useRef } from 'react';
import { Col, ListGroup, Row, Alert, Button } from 'react-bootstrap';
import Option from './Option/Option';

export default function Settings(props) {
    const {settings} = props;
    const [Active, setActive] = useState(0);
    
    return(
        <>
        {ozplugin_vars.customNotice && <Alert variant={ozplugin_vars.customNotice.variant || 'primary'}>
            <Row className="align-items-center">
                <Col>{ozplugin_vars.customNotice.text}</Col>
            </Row>
        </Alert>
        }
        <Row>
            <Col md={2}>
                <ListGroup className="oz_sidebar">
                {settings.map((tab, index) => {
                return(
                <ListGroup.Item onClick={() => setActive(index)} className={`${Active == index ? 'active' : ''}`} action>{tab.name}</ListGroup.Item>
                )
                })}
                </ListGroup>
            </Col>
            <Col md={10}>
                {settings.map((setting, index) => {
                    let key = index
                    let tab = setting.options
                    return(
                    <ListGroup className={`${key == Active ? '' : 'd-none'}`} variant="flush">
                        {tab.length ? tab.map(option => {
                            if (typeof option.isPRO != 'undefined' && !option.isPRO) return null
                            return <Option option={option} />
                        }) :
                        ozplugin_lang.nosettingsthistab}
                    </ListGroup>
                    )
                })}
            </Col>
        </Row>
        </>
    )
}