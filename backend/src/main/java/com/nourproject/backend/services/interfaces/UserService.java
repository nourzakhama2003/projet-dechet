package com.nourproject.backend.services.interfaces;

import com.nourproject.backend.dtos.user.UserDto;
import com.nourproject.backend.dtos.user.UserUpdateDto;
import com.nourproject.backend.dtos.Response;
import com.nourproject.backend.entities.User;


public interface UserService {


    Response findAll();


    User getByUserName(String username);

    User getByEmail(String email);


    Response findById(String id);


    Response findByUserName(String username);


    Response findByEmail(String email);

    Response save(UserDto userDto);

    Response updateById(String id, UserUpdateDto userUpdateDto);


    Response deleteByUserId(String id);


    Response createOrUpdateUser(UserDto userDto);
}
