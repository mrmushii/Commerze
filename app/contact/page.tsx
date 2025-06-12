// app/contact/page.tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import axios from 'axios'; // For simulating API call
import Link from 'next/link'; // For Home link
import { Mail, Phone, MapPin, Send } from 'lucide-react'; // Icons for contact info and send button

// Define Zod schema for the contact form
const contactFormSchema = z.object({
  name: z.string().min(1, { message: 'Your name is required.' }),
  email: z.string().email({ message: 'A valid email is required.' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }).max(1000, { message: 'Message cannot exceed 1000 characters.' }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactSupportPage() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = form;

  // Handle form submission
  const onSubmit = async (data: ContactFormValues) => {
    toast.dismiss();
    toast.loading('Sending your message...', { id: 'contact-submit' });

    try {
      // Simulate API call to send message (replace with your actual backend endpoint)
      // In a real app, this would hit an endpoint like /api/contact
      console.log('Contact form data:', data);
      const response = await axios.post('/api/contact', data); // Assuming a simple /api/contact endpoint

      // Simulate success or failure
      if (response.status === 200) { // Check for a 200 OK status
        toast.success('Message sent successfully! We will get back to you soon.', { id: 'contact-submit' });
        reset(); // Reset form fields
      } else {
        toast.error('Failed to send message. Please try again.', { id: 'contact-submit' });
      }

    } catch (error: unknown) {
      console.error('Contact form submission error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message, { id: 'contact-submit' });
      } else if (error instanceof Error) {
        toast.error(error.message || 'An unexpected error occurred.', { id: 'contact-submit' });
      } else {
        toast.error('An unexpected error occurred.', { id: 'contact-submit' });
      }
    }
  };

  return (
    <div className="container mx-auto mt-10 px-4 py-8">
      {/* Breadcrumbs */}
      <div className="text-gray-600 text-sm mb-4">
        <Link href="/" className="hover:underline">Home</Link> &gt; Contact Us
      </div>

      <h1 className="text-5xl font-extrabold text-gray-900 text-center mb-12 tracking-tight">
        Get In Touch
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-2xl shadow-xl p-8 lg:p-12">
        {/* Left Column: Contact Information */}
        <div className="flex flex-col justify-center space-y-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Contact Information</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Have questions, feedback, or need assistance? Reach out to us through any of the methods below. We're here to help!
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-700">
              <Mail className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <p>support@commerze.com</p>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <Phone className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <p>+8801716565656</p>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <p>124,Alfalah goli,Chattogram,Bangladesh</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Looking for quick answers?</h3>
            <Link href="/faq" className="text-blue-600 hover:underline inline-flex items-center gap-2">
              Visit our FAQ & Help Center
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </Link>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="p-8 bg-gray-50 rounded-xl shadow-lg"> {/* Slightly raised card for the form */}
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                id="subject"
                {...register('subject')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
              <textarea
                id="message"
                rows={5}
                {...register('message')}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white text-lg transition duration-300 ease-in-out ${
                isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md'
              }`}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
