<?php

namespace App\Enums;

enum PatronType: string
{
    case Student = 'Student';
    case Faculty = 'Faculty';
    case Guest = 'Guest';
    case Staff = 'Staff';
}
