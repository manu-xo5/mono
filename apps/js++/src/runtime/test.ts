import { Branch } from "@/parser/ast/branch";
import { VarDeclarationStmt } from "@/parser/ast/def_const";
import { Program } from "@/parser/ast/program";
import { Scope } from "@/parser/scope";
import { to_string } from "@/parser/stringify";

const global_scope = new Scope(0);

const prg = new Program();

prg.append_stmt(
    new VarDeclarationStmt(global_scope, "count", 0),
);

prg.append_stmt(
    new Branch(global_scope, false)
        .cond(global_scope.get_local("count"))
        .then(scope => [new VarDeclarationStmt(scope, "count2", 1000)]),
);

console.debug(to_string(prg.generate_bytecode()));

/**
 * const c = 0
 *
 * const handleClick = function() {
 * }
 *
 * const getFirstMockClick = handleClick();
 *
 * const handleFetch = function () {
 *  return fetch(...).then(r => r.json());
 * }
 *
 * const renderAsFetch = handleFetch();
 *
 * useEffect(handleFetch, []);
 *
 * return (
 *  <button onClick={handleClick} />
 * )
 *
 */

/**
 * tempChildren = [];
 *
 * tempProps = {
 * }
 *
 * const temp = {
 *  name: "button",
 *  props: tempProps,
 *  children: tempChildren
 * }
 * return temp as button
 */

