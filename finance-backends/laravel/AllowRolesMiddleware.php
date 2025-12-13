<?php
namespace App\Http\Middleware;
use Closure;

class AllowRolesMiddleware {
    public function handle($request, Closure $next, ...$roles) {
        $user = auth()->user();
        if (!$user || !in_array($user->role, $roles)) {
            return response()->json(['error' => 'Acesso negado'], 403);
        }
        return $next($request);
    }
}

