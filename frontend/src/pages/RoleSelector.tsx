import type {UserRole} from '../types/UserRole';

type RoleSelectorProps = {
    selectedRole: UserRole;
    onRoleChange: (role: UserRole) => void;
}

export default function RoleSelector({selectedRole, onRoleChange}: RoleSelectorProps) {
    return (
        <div className={"role-selector"}>
            <button className={selectedRole === "STUDENT" ? "role-button active" : "role-button"}
                    onClick={() => onRoleChange("STUDENT")}>
            Student
            </button>
            <button className={selectedRole === "TEACHER" ? "role-button active" : "role-button"}
                    onClick={() => onRoleChange("TEACHER")}>
                Teacher
            </button>
            <button className={selectedRole === "ADMIN" ? "role-button active" : "role-button"}
                    onClick={() => onRoleChange("ADMIN")}>
            Admin
            </button>
        </div>
    );
}