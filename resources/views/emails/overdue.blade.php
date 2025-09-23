@component('mail::message')
# Overdue Book Reminder

Hello **{{ $patron->name }}**,

This is a reminder that the book:

**{{ $book->title }}**  
Author: {{ $book->author }}  
Due Date: {{ $book->due_date }}

is now **overdue**.

Please return it to the library as soon as possible.

Thanks,  
{{ config('app.name') }}
@endcomponent
