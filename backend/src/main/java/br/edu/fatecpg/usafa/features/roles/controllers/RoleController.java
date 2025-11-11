package br.edu.fatecpg.usafa.features.roles.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Importante
import org.springframework.web.bind.annotation.*;

import br.edu.fatecpg.usafa.features.roles.interfaces.IRoleService;
import br.edu.fatecpg.usafa.models.Role;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/roles")
@PreAuthorize("hasRole('ADMIN')") // <-- TRAVA DE SEGURANÇA! Só ADMIN mexe aqui.
public class RoleController {

    private final IRoleService roleService;

    @Autowired
    public RoleController(IRoleService roleService) {
        this.roleService = roleService;
    }

    /**
     * Endpoint para pegar todas as roles existentes do banco.
     * GET /api/roles
     */
    @GetMapping
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    /**
     * Endpoint para criar uma nova role.
     * POST /api/roles
     * Body: { "name": "ROLE_MODERATOR" }
     */
    @PostMapping
    public ResponseEntity<Role> createRole(@RequestBody Map<String, String> payload) {
        String roleName = payload.get("name");
        Role createdRole = roleService.createRole(roleName);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRole);
    }

    /**
     * Endpoint para pegar as roles de um usuário específico.
     * GET /api/roles/user/{id_publico_do_usuario}
     */
    @GetMapping("/user/{userPublicId}")
    public ResponseEntity<Set<Role>> getUserRoles(@PathVariable String userPublicId) {
        return ResponseEntity.ok(roleService.getUserRoles(userPublicId));
    }

    // DTO (Data Transfer Object) simples para o body da requisição
    record AddRoleRequest(String userPublicId, String roleName) {}

    /**
     * Endpoint para adicionar uma role a um usuário.
     * POST /api/roles/user/add
     * Body: { "userPublicId": "abc-123", "roleName": "ROLE_ADMIN" }
     */
    @PostMapping("/user/add")
    public ResponseEntity<Void> addRoleToUser(@RequestBody AddRoleRequest request) {
        roleService.addRoleToUser(request.userPublicId(), request.roleName());
        return ResponseEntity.ok().build();
    }
}
