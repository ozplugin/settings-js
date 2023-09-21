import React, { useState, useEffect, useRef } from 'react';
import { Button, Navbar, Container, Col } from 'react-bootstrap';


export default function Navigation() {


    return (
        <Navbar className="border-bottom bg-white">
        <Container className="flex-wrap flex-sm-nowrap" fluid>
          <Col>
          <Navbar.Toggle />
            {(ozplugin_vars.logo && ozplugin_vars.logo.img) &&
            <Navbar.Brand href={ozplugin_vars.logo.url}><img style={{maxWidth: 64}} src={ozplugin_vars.logo.img} /></Navbar.Brand>}
          </Col>
          <Col className="d-flex mt-2 mt-sm-0 oz_nav-right">
            <Button href={ozplugin_vars.adminURL} as="a" className='ms-auto d-flex align-items-center' variant="outline-secondary"><span className="dashicons dashicons-wordpress-alt me-2" />{ozplugin_lang.backtowp}</Button>
          </Col>
          </Container>
        </Navbar>
    )
}