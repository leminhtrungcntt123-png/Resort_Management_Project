package resort_management.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import resort_management.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
        throws UsernameNotFoundException {

        return userRepository.findByUsername(username)
            .map(user -> new org.springframework.security.core.userdetails.User(
                    user.getUsername(),
                    user.getPassword(),
                    user.getIsActive(),
                    true,
                    true,
                    true,
                    List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
            ))
            .orElseThrow(() -> new UsernameNotFoundException(
                    "Không tìm thấy user: " + username));
        }
}