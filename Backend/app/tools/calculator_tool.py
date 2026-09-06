"""Safe arithmetic evaluator. No eval(), no names except a small math whitelist."""

import ast
import math
import operator
from typing import Any, Union

from app.exceptions import ToolRejectedError

Number = Union[int, float]

_BIN_OPS: dict[type, Any] = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}

_UNARY_OPS: dict[type, Any] = {
    ast.UAdd: operator.pos,
    ast.USub: operator.neg,
}

_FUNCTIONS = {
    "abs": abs,
    "round": round,
    "min": min,
    "max": max,
    "sqrt": math.sqrt,
    "log": math.log,
    "log10": math.log10,
    "exp": math.exp,
    "sin": math.sin,
    "cos": math.cos,
    "tan": math.tan,
    "floor": math.floor,
    "ceil": math.ceil,
}

_CONSTANTS = {
    "pi": math.pi,
    "e": math.e,
}


def _eval_node(node: ast.AST) -> Number:
    if isinstance(node, ast.Expression):
        return _eval_node(node.body)
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)) and not isinstance(node.value, bool):
        return node.value
    if isinstance(node, ast.UnaryOp) and type(node.op) in _UNARY_OPS:
        return _UNARY_OPS[type(node.op)](_eval_node(node.operand))
    if isinstance(node, ast.BinOp) and type(node.op) in _BIN_OPS:
        left = _eval_node(node.left)
        right = _eval_node(node.right)
        if isinstance(node.op, ast.Pow) and (abs(left) > 1e6 or abs(right) > 20):
            raise ToolRejectedError("Exponentiation exceeds safe bounds.")
        if isinstance(node.op, (ast.Div, ast.FloorDiv, ast.Mod)) and right == 0:
            raise ToolRejectedError("Division by zero.")
        return _BIN_OPS[type(node.op)](left, right)
    if isinstance(node, ast.Name) and node.id in _CONSTANTS:
        return _CONSTANTS[node.id]
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
        name = node.func.id
        if name not in _FUNCTIONS or node.keywords:
            raise ToolRejectedError("Function is not allowed in calculator expressions.", detail={"name": name})
        args = [_eval_node(arg) for arg in node.args]
        try:
            result = _FUNCTIONS[name](*args)
        except Exception as exc:  # noqa: BLE001
            raise ToolRejectedError("Calculator function failed.", detail={"reason": str(exc)}) from exc
        if not isinstance(result, (int, float)) or isinstance(result, bool):
            raise ToolRejectedError("Calculator produced a non-numeric result.")
        return result
    raise ToolRejectedError("Expression is not valid arithmetic.")


def evaluate(expression: str) -> Number:
    """Evaluate a numeric expression. Rejects anything non-arithmetic."""
    text = (expression or "").strip()
    if not text or len(text) > 512:
        raise ToolRejectedError("Calculator expression is empty or too long.")
    try:
        tree = ast.parse(text, mode="eval")
    except SyntaxError as exc:
        raise ToolRejectedError("Calculator expression is not valid arithmetic.") from exc
    value = _eval_node(tree)
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ToolRejectedError("Calculator produced a non-numeric result.")
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        raise ToolRejectedError("Calculator produced a non-finite result.")
    return value
