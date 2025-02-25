Interactive webhook endpoint builder
View the text-based guide
Learn how to set up and deploy a webhook event destination to listen to events from Stripe. Use webhook event destinations for post-payment commerce events such as sending custom email receipts, fulfilling orders, or updating your database. Do these steps in test mode or a sandbox before doing them in live mode.


Download full app
Don't code? Use Stripe’s no-code options or get help from our partners.
1
Set up an endpoint
Install the Stripe Python package
Install the Stripe package and import it in your code. Alternatively, if you’re starting from scratch and need a requirements.txt file, download the project files using the link in the code editor.


pip

GitHub
Install the package via pip:

pip3 install stripe

Server
Create a new endpoint
A webhook endpoint is a destination on your server that receives requests from Stripe, notifying you about events that happen on your account such as a customer disputing a charge or a successful recurring payment. Add a new endpoint to your server and make sure it’s publicly accessible so we can send unauthenticated POST requests.

Server
2
Handle requests from Stripe
Read the event data
Stripe sends the event data in the request body. Each event is structured as an Event object with a type, id, and related Stripe resource nested under data.

Server
Handle the event
As soon as you have the event object, check the type to know what kind of event happened. You can use one webhook to handle several different event types at once, or set up individual endpoints for specific events.

Server
Return a 200 response
Send a successful 200 response to Stripe as quickly as possible because Stripe retries the event if a response isn’t sent within a reasonable time. Write any long-running processes as code that can run asynchronously outside the webhook endpoint.

Server
3
Test the webhook
Run the server
Build and run your server to test the endpoint at http://localhost:4242/webhook.

python3 -m flask --app server run --port=4242

Server
Download the CLI
Use the Stripe CLI to test your webhook locally. Download the CLI and log in with your Stripe account. Alternatively, use a service like ngrok to make your local endpoint publicly accessible.

stripe login

Run in the Stripe Shell
Server
Forward events to your webhook
Set up event forwarding with the CLI to send all Stripe events in test mode to your local webhook endpoint.

stripe listen --forward-to localhost:4242/webhook

Run in the Stripe Shell
Server
Simulate events
Use the CLI to simulate specific events that test your webhook application logic by sending a POST request to your webhook endpoint with a mocked Stripe event object.

stripe trigger payment_intent.succeeded

Run in the Stripe Shell
Server
4
Secure your webhook
Secure your webhook
Verify the source of a webhook request to prevent bad actors from sending fake payloads or injecting SQL that modify your backend systems. Secure your webhook with a client signature to validate that Stripe generated a webhook request and that it didn’t come from a server acting like Stripe.

Server
Add the endpoint signing secret
Each webhook endpoint has a unique signing secret. Find the secret in the webhooks section of the Dashboard, or, if you’re testing locally with the Stripe CLI, from the CLI output with the command stripe listen.

Server
Verify the event
Use the Stripe library to verify and construct the event from Stripe. You need the endpoint secret, the request headers, and the raw request body to properly verify the event. Alternatively, you can manually verify the signature without having to use the Stripe library.

Server
Read the request signature
Each request from Stripe contains a Stripe-Signature header. Store a reference to this header value for later use.

Server
Verify the request
Use the Stripe library to verify that the request came from Stripe. Pass the raw request body, Stripe-Signature header, and endpoint secret to construct an Event.

Server
Handle errors
Checking for errors helps catch improperly configured webhooks or malformed requests from non-Stripe services. Common errors include using the wrong endpoint secret, passing a parsed representation (for example, JSON) of the request body, or reading the wrong request header.

Server
Test the endpoint
Test your secured endpoint by using the Stripe CLI, which sends the proper signature header in each test event.

Server
Next steps
Going live
Learn how to deploy your webhook endpoint to production and handle events at scale by only sending the specific events you need.

Best practices
Understand best practices for maintaining your endpoint, such as managing retries or duplicate events.

Stripe CLI
The Stripe CLI has several commands that can help test your Stripe application beyond webhooks.

#! /usr/bin/env python3.6
# Python 3.6 or newer required.

import json
import os
import stripe
# This is your test secret API key.
stripe.api_key = 'sk_test_51Qu227BaoZfv78XzAPnv3CoWQ2lgpzQAuQIa1MPBt2j6pXa1sWDtiHXsQhl1XjHUBcamDEJpGZeuyAjXnYgxKw8I00rFwsbq42'

# Replace this endpoint secret with your endpoint's unique secret
# If you are testing with the CLI, find the secret by running 'stripe listen'
# If you are using an endpoint defined with the API or dashboard, look in your webhook settings
# at https://dashboard.stripe.com/webhooks
endpoint_secret = 'whsec_...'
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    event = None
    payload = request.data

    try:
        event = json.loads(payload)
    except json.decoder.JSONDecodeError as e:
        print('⚠️  Webhook error while parsing basic request.' + str(e))
        return jsonify(success=False)
    if endpoint_secret:
        # Only verify the event if there is an endpoint secret defined
        # Otherwise use the basic event deserialized with json
        sig_header = request.headers.get('stripe-signature')
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except stripe.error.SignatureVerificationError as e:
            print('⚠️  Webhook signature verification failed.' + str(e))
            return jsonify(success=False)

    # Handle the event
    if event and event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']  # contains a stripe.PaymentIntent
        print('Payment for {} succeeded'.format(payment_intent['amount']))
        # Then define and call a method to handle the successful payment intent.
        # handle_payment_intent_succeeded(payment_intent)
    elif event['type'] == 'payment_method.attached':
        payment_method = event['data']['object']  # contains a stripe.PaymentMethod
        # Then define and call a method to handle the successful attachment of a PaymentMethod.
        # handle_payment_method_attached(payment_method)
    else:
        # Unexpected event type
        print('Unhandled event type {}'.format(event['type']))

    return jsonify(success=True)