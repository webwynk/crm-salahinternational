<?php

namespace App\Exceptions;

use Exception;

class InsufficientStockException extends Exception
{
    protected string $errorCode = 'STOCK_INSUFFICIENT';

    public function __construct(string $message = 'Insufficient stock available.', int $code = 409)
    {
        parent::__construct($message, $code);
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }
}
